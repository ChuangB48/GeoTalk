const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);
const pool = new Pool({
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    database : process.env.DB_NAME,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD
});
app.use(
    session({
        secret : process.env.SESSION_SECRET,
        resave : false,
        saveUninitialized : false,
        store : new pgSession({
            pool : pool,
            createTableIfMissing : true
        }),
        cookie : {
            httpOnly : true,
            secure : false,
            sameSite : "lax",
            maxAge : 1000 * 60 * 60 * 24 * 7
        }
    })
);
app.get("/api",(_req, res) => {
    res.json({
        "message" : "bn -r"
    });
});
app.get("/api/test-db",async (_req, res) => {
    try{
        const result=await pool.query("SELECT NOW() AS current_time");
        res.json({
            "success" : true,
            "message" : "db -con",
            "database" : process.env.DB_NAME,
            "current_time" : result.rows[0].current_time
        });
    }
    catch(error){
        console.error("Database connection error:", error);
        res.status(500).json({
            "success" : false,
            "message" : "db -fail"
        });
    }
});
app.post("/api/login",async (req, res) => {
    try {
        const {username,password} = req.body;
        if (!username || !password) {
            return res.status(400).json({
                "success" : false,
                "message" : "un pw -req"
            });
        }
        const clean_username = username.trim();
        const result = await pool.query(
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
        if (result.rows.length === 0) {
            return res.status(401).json({
                "success" : false,
                "message" : "un pw -inv"
            });
        }
        const user = result.rows[0];
        const password_match = await bcrypt.compare(
            password,
            user.password_hash
        );
        if (!password_match) {
            return res.status(401).json({
                "success" : false,
                "message" : "un pw -inv"
            });
        }
        res.json({
            "success" : true,
            "message" : "log -suc",
            "user" : {
                "id" : user.id,
                "username" : user.username,
                "email" : user.email
            }
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            "success" : false,
            "message" :"sv -err"
        });
    }
});
app.post("/api/register",async (req, res) => {
    try{
        const{username,password} = req.body;
        if (!username || !password) {
            return res.status(400).json({
                "success" : false,
                "message" : "un pw -req"
            });
        }
        const clean_username=username.trim();
        if (clean_username.length < 3) {
            return res.status(400).json({
                "success" : false,
                "message" : "un -short"
            });
        }
        else if (clean_username.length > 50) {
            return res.status(400).json({
                "success" : false,
                "message" : "un -long"
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                "success" : false,
                "message" : "pw -short"
            });
        }
        const existing_user = await pool.query(
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
        if (existing_user.rows.length > 0) {
            const user = existing_user.rows[0];
            if(user.username === clean_username){
                return res.status(409).json({
                    "success" : false,
                    "message" : "un -taken"
                });
            }
        }
        const password_hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
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
        const new_user = result.rows[0];
        res.status(201).json({
            "success" : true,
            "message" : "acc -suc",
            "user" : new_user
        });
    }
    catch(error){
        console.error("Registration error:", error);
        if (error.code === "23505") {
            return res.status(409).json({
                "success" : false,
                "message" : "un -taken"
            });
        }
        res.status(500).json({
            "success" : false,
            "message" : "sv -err"
        });
    }
});
app.listen(PORT, () => {
    console.log("server running");
});