const express=require("express");
const path=require("path");
const {Pool}=require("pg");
const bcrypt=require("bcryptjs");
const session=require("express-session");
const pgSession=require("connect-pg-simple")(session);
require("dotenv").config();
const app=express();
const PORT=process.env.PORT||3000;
app.use(express.json({"limit":"2mb"}));
app.use(
    express.static(
        path.join(__dirname,"../frontend")
    )
);
const pool=process.env.DATABASE_URL
    ? new Pool({
        connectionString:process.env.DATABASE_URL
    })
    : new Pool({
        host:process.env.DB_HOST||"localhost",
        port:Number(process.env.DB_PORT||5432),
        database:process.env.DB_NAME,
        user:process.env.DB_USER,
        password:process.env.DB_PASSWORD
    });
app.use(
    session({
        secret:process.env.SESSION_SECRET,
        resave:false,
        saveUninitialized:false,
        store:new pgSession({
            pool:pool,
            createTableIfMissing:true
        }),
        cookie:{
            httpOnly:true,
            secure:false,
            sameSite:"lax",
            maxAge:1000*60*60
        }
    })
);
let geocodeQueue=Promise.resolve();
let lastGeocodeRequestAt=0;
function sleep(ms){
    return new Promise(resolve=>setTimeout(resolve,ms));
}
async function searchNominatim(area){
    const task=geocodeQueue.then(async()=>{
        const waitTime=Math.max(0,1100-(Date.now()-lastGeocodeRequestAt));
        if(waitTime>0){
            await sleep(waitTime);
        }
        lastGeocodeRequestAt=Date.now();
        const params=new URLSearchParams({
            "q":area,
            "format":"jsonv2",
            "limit":"1",
            "accept-language":"zh-TW"
        });
        const url="https://nominatim.openstreetmap.org/search?"+params.toString();
        const response=await fetch(url,{
            headers:{
                "User-Agent":"GeoTalk/1.0 (contact: kecianchuang@gmail.com)",
                "Accept":"application/json"
            }
        });
        if (!response.ok) {
            throw new Error(
                `Nominatim request failed: HTTP ${response.status}`
            );
        }
        const results=await response.json();
        if(!Array.isArray(results)||results.length===0){
            return null;
        }
        return results[0];
    });
    geocodeQueue=task.catch(()=>{});
    return task;
}
async function getCoordinatesForArea(area){
    if(typeof area!=="string"||!area.trim()){
        return null;
    }
    const queryText=area.trim().replace(/\s+/g," ");
    const areaKey=queryText.toLocaleLowerCase("zh-TW");
    const cached=await pool.query(
        `SELECT display_name, lat, lng
         FROM geocode_cache
         WHERE area_key = $1`,
        [areaKey]
    );
    if(cached.rows.length>0){
        console.log("Geocode cache hit:",queryText);
        return cached.rows[0];
    }
    const place=await searchNominatim(queryText);
    if(!place){
        return null;
    }
    const lat=Number(place.lat);
    const lng=Number(place.lon);
    if(!Number.isFinite(lat)||!Number.isFinite(lng)||lat<-90||lat>90||lng<-180||lng>180){
        throw new Error("Invalid coordinates from Nominatim");
    }
    const saved=await pool.query(
        `INSERT INTO geocode_cache (
            area_key,
            query_text,
            display_name,
            lat,
            lng
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (area_key)
        DO UPDATE SET
            query_text = EXCLUDED.query_text,
            display_name = EXCLUDED.display_name,
            lat = EXCLUDED.lat,
            lng = EXCLUDED.lng
        RETURNING display_name, lat, lng`,
        [
            areaKey,
            queryText,
            place.display_name,
            lat,
            lng
        ]
    );
    console.log("Geocode cache saved:", queryText);
    return saved.rows[0];
}
app.get("/api",(_req, res)=>{
    res.json({
        "message":"bn -r"
    });
});
app.get("/api/tast-db",async(_req, res)=>{
    try{
        const result=await pool.query("SELECT NOW() AS current_time");
        res.json({
            "success":true,
            "message":"db -con",
            "database":process.env.DB_NAME,
            "current_time":result.rows[0].current_time
        });
    }
    catch(error){
        console.error("Database connection error:",error);
        res.status(500).json({
            "success":false,
            "message":"db -fail"
        });
    }
});
app.post("/api/login",async(req,res)=>{
    try{
        const {username,password}=req.body;
        if(!username||!password){
            return res.status(400).json({
                "success":false,
                "message":"201"
            });
        }
        const clean_username=username.trim();
        const result=await pool.query(
            `
            SELECT
                id,
                username,
                email,
                password_hash
            FROM users
            WHERE email = $1
               OR username = $1
            LIMIT 1
            `,
            [clean_username]
        );
        if(result.rows.length===0){
            return res.status(401).json({
                "success":false,
                "message":"202"
            });
        }
        const user=result.rows[0];
        const password_match=await bcrypt.compare(
            password,
            user.password_hash
        );
        if(!password_match){
            return res.status(401).json({
                "success":false,
                "message":"203"
            });
        }
        req.session.userId=user.id;
        res.json({
            "success":true,
            "user":{
                "id":user.id,
                "username":user.username,
                "email":user.email
            }
        });
    }
    catch(error){
        console.error("Login error:",error);
        res.status(500).json({
            "success":false,
            "message":"204"
        });
    }
});
app.post("/api/register",async(req,res)=>{
    try{
        const{username,password}=req.body;
        if(!username||!password){
            return res.status(400).json({
                "success":false,
                "message":"201"
            });
        }
        const clean_username=username.trim();
        if(clean_username.length<3){
            return res.status(400).json({
                "success":false,
                "message":"202"
            });
        }
        else if(clean_username.length>50){
            return res.status(400).json({
                "success":false,
                "message":"203"
            });
        }
        if(password.length<6){
            return res.status(400).json({
                "success":false,
                "message":"204"
            });
        }
        const existing_user=await pool.query(
            `
            SELECT id, username
            FROM users
            WHERE username = $1
            LIMIT 1
            `,
            [
                clean_username
            ]
        );
        if(existing_user.rows.length>0){
            const user=existing_user.rows[0];
            if(user.username===clean_username){
                return res.status(409).json({
                    "success":false,
                    "message":"205"
                });
            }
        }
        const password_hash=await bcrypt.hash(password, 10);
        const result=await pool.query(
            `
            INSERT INTO users
            (
                username,
                password_hash
            )
            VALUES
            (
                $1,
                $2
            )
            RETURNING
                id,
                username,
                created_time
            `,
            [
                clean_username,
                password_hash
            ]
        );
        const new_user=result.rows[0];
        res.status(201).json({
            "success":true,
            "user":new_user
        });
    }
    catch(error){
        console.error("Registration error:",error);
        if (error.code==="23505") {
            return res.status(409).json({
                "success":false,
                "message":"205"
            });
        }
        res.status(500).json({
            "success":false,
            "message":"206"
        });
    }
});
app.get("/api/me",async(req,res)=>{
    try{
        if(!req.session.userId){
            return res.status(401).json({
                "success":false
            });
        }
        const result=await pool.query(
            `
                SELECT
                    id,
                    username,
                    email,
                    avatar
                FROM users
                WHERE id = $1
                LIMIT 1
            `,
            [req.session.userId]
        );
        if(result.rows.length===0){
            req.session.destroy(()=>{});
            return res.status(401).json({
                "success":false
            });
        }
        res.json({
            "success":true,
            "user":result.rows[0]
        });
    }
    catch(error){
        console.error("Get current user error:",error);
        res.status(500).json({
            "success":false
        });
    }
});
app.get("/api/posts",async(_req,res)=>{
    try{
        const result=await pool.query(
            `SELECT
                p.id,
                p.user_id,
                COALESCE(u.username, '未知使用者') AS username,
                p.title,
                p.body,
                p.tags,
                p.lat,
                p.lng,
                p.location_type,
                p.location_name
             FROM posts AS p
             LEFT JOIN users AS u
                ON u.id = p.user_id
             WHERE p.lat IS NOT NULL
               AND p.lng IS NOT NULL
             ORDER BY p.id DESC
             LIMIT 200`
        );
        res.status(200).json({
            "success":true,
            "posts":result.rows
        });
    }
    catch(error){
        res.status(500).json({
            "success":false,
            "message":"201"
        });
    }
});
app.post("/api/posts",async(req,res)=>{
    try{
        const userId=req.session?.userId??req.session?.user?.id;
        if(!userId){
            return res.status(401).json({
                "error":"201"
            });
        }
        const{title,body,lat,lng,tag,type}=req.body;
        if(typeof title!=="string"||!title.trim()||title.trim().length>80){
            return res.status(400).json({
                "error":"202"
            });
        }
        if(typeof body!=="string"||!body.trim()||body.trim().length>2000){
            return res.status(400).json({
                "error":"203"
            });
        }
        let finalLat;
        let finalLng;
        let locationName=null;
        if (type==="current"){
            if(lat===undefined||lng===undefined||lat===null||lng===null){
                return res.status(400).json({
                    "error":"204"
                });
            }
            finalLat=Number(lat);
            finalLng=Number(lng);
            if(!Number.isFinite(finalLat)||!Number.isFinite(finalLng)||finalLat<-90||finalLat>90||finalLng<-180||finalLng>180){
                return res.status(400).json({
                    "error":"205"
                });
            }
        }
        else if(type==="primary_area"){
            const userResult=await pool.query(
                `SELECT region
                 FROM users
                 WHERE id = $1`,
                [userId]
            );
            if(userResult.rows.length===0){
                return res.status(404).json({
                    "error":"206"
                });
            }
            const user=userResult.rows[0];
            if(typeof user.region!=="string"||!user.region.trim()){
                return res.status(400).json({
                    "error":"207"
                });
            }
            const place=await getCoordinatesForArea(
                user.region.trim()
            );
            if(!place){
                return res.status(400).json({
                    "error":"208"
                });
            }
            finalLat=Number(place.lat);
            finalLng=Number(place.lng);
            locationName=user.region.trim();
            if(!Number.isFinite(finalLat)||!Number.isFinite(finalLng)||finalLat<-90||finalLat>90||finalLng<-180||finalLng>180){
                return res.status(500).json({
                    "error":"209"
                });
            
            }
        }
        const result=await pool.query(
            `INSERT INTO posts (
                user_id,
                title,
                body,
                lat,
                lng,
                tags,
                location_type,
                location_name
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
                id,
                title,
                body,
                lat,
                lng,
                tags,
                location_type,
                location_name,
                time`,
            [
                userId,
                title.trim(),
                body.trim(),
                finalLat,
                finalLng,
                tag,
                type,
                locationName
            ]
        );
        return res.status(201).json({
            "message":"post -suc",
            "post":result.rows[0]
        });
    }
    catch(error){
        console.error("Create post failed:",error);
        return res.status(500).json({
            "error":"210"
        });
    }
});
app.get("/api/my-posts",async(req,res)=>{
    try{
        const userId=req.session?.userId;
        if(!userId){
            return res.status(401).json({
                "success":false,
                "error":"201"
            });
        }
        const result=await pool.query(
            `
                SELECT
                    id,
                    user_id,
                    title,
                    body,
                    tags,
                    lat,
                    lng,
                    location_type,
                    location_name,
                    time
                FROM posts
                WHERE user_id = $1
                ORDER BY id DESC
                LIMIT 200
            `,
            [userId]
        );
        return res.status(200).json({
            "success":true,
            "posts":result.rows
        });
    }
    catch(error){
        return res.status(500).json({
            "success":false,
            "error":"202"
        });
    }
});
app.delete("/api/posts/:id",async(req,res)=>{
    try{
        const userId=req.session?.userId;
        if(!userId){
            return res.status(401).json({
                "success":false,
                "error":"201"
            });
        }
        const postId=req.params.id;
        if(!/^[1-9]\d*$/.test(postId)){
            return res.status(400).json({
                "success":false,
                "error":"202"
            });
        }
        const result=await pool.query(
            `
            DELETE FROM posts
            WHERE id = $1
              AND user_id = $2
            RETURNING id
            `,
            [postId, userId]
        );
        if(result.rowCount===0){
            return res.status(404).json({
                "success":false,
                "error":"203"
            });
        }
        return res.status(200).json({
            "success":true,
            "message":"貼文已刪除",
            "deletedId":result.rows[0].id
        });
    }
    catch(error){
        console.error("Delete post failed:",error);
        return res.status(500).json({
            "success":false,
            "error":"204"
        });
    }
});
app.get("/api/profile",async(req,res)=>{
    try{
        const userId=req.session?.userId;
        if(!userId){
            return res.status(401).json({
                "success":false,
                "message":"201"
            });
        }
        const result=await pool.query(
            `
            SELECT
                id,
                username,
                email,
                region,
                gender,
                avatar,
                birth,
                bio,
                url
            FROM users
            WHERE id = $1
            `,
            [userId]
        );
        if(result.rowCount===0){
            return res.status(404).json({
                "success":false,
                "message":"202"
            });
        }
        return res.json({
            "success":true,
            "profile":result.rows[0]
        });
    }
    catch(error){
        return res.status(500).json({
            "success":false,
            "message":"203"
        });
    }
});
app.put("/api/profile",async(req,res)=>{
    try{
        const userId=req.session?.userId;
        if(!userId){
            return res.status(401).json({
                "success":false,
                "message":"201"
            });
        }
        const {username,email,region,gender,avatar,birth,bio,url}=req.body||{};
        if(typeof username!=="string"||username.trim().length>30){
            return res.status(400).json({
                "success":false,
                "message":"202"
            });
        }
        if(typeof region!=="string"||region.trim().length>100){
            return res.status(400).json({
                "success":false,
                "message":"203"
            });
        }

        const cleanEmail=typeof email==="string"?email.trim():"";
        if(cleanEmail.length>254||(cleanEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))){
            return res.status(400).json({
                "success":false,
                "message":"204"
            });
        }
        const cleanGender=typeof gender==="string"?gender.trim():"";
        const cleanBio=typeof bio==="string"?bio.trim():"";
        const clean_url=typeof url==="string"?url.trim():"";
        const cleanBirth=typeof birth==="string"?birth.trim():"";
        if(cleanGender.length>20){
            return res.status(400).json({
                "success":false,
                "message":"205"
            });
        }
        if(cleanBio.length>500){
            return res.status(400).json({
                "success":false,
                "message":"206"
            });
        }
        if(clean_url.length>1000){
            return res.status(400).json({
                "success":false,
                "message":"207"
            });
        }
        if(cleanBirth){
            const date=new Date(`${cleanBirth}T00:00:00.000Z`);
            if(!/^\d{4}-\d{2}-\d{2}$/.test(cleanBirth)||Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==cleanBirth||cleanBirth>new Date().toISOString().slice(0,10)){
                return res.status(400).json({
                    "success":false,
                    "message":"208"
                });
            }
        }
        if(avatar){
            if(typeof avatar!=="string"){
                return res.status(400).json({
                    "success":false,
                    "message":"209"
                });
            }
            if(avatar.length>1000000){
                return res.status(400).json({
                    "success":false,
                    "message":"，210"
                });
            }
            const valid=/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(avatar);
            if(!valid){
                return res.status(400).json({
                    "success":false,
                    "message":"211"
                });
            }
        }
        const result=await pool.query(
            `
            UPDATE users
            SET
                username = $1,
                email = $2,
                region = $3,
                gender = $4,
                avatar = CASE
                    WHEN $5::boolean THEN $6::varchar
                    ELSE avatar
                END,
                birth = $7::date,
                bio = $8,
                url = $9
            WHERE id = $10
            RETURNING
                id, username, email, region,
                gender, avatar, birth, bio, url
            `,
            [
                username.trim(),
                cleanEmail?cleanEmail.toLowerCase():null,
                region.trim(),
                cleanGender||null,
                (avatar!==""),
                avatar,
                cleanBirth||null,
                cleanBio||null,
                clean_url,
                userId
            ]
        );
        if(result.rowCount===0){
            return res.status(404).json({
                "success":false,
                "message":"212"
            });
        }
        return res.json({
            "success":true,
            "profile":result.rows[0]
        });

    }
    catch(error){
        if (error.code==="23505") {
            return res.status(409).json({
                "success":false,
                "message":"213"
            });
        }
        return res.status(500).json({
            "success":false,
            "message":"214"
        });
    }
});
app.listen(PORT,()=>{
    console.log("server running");
});