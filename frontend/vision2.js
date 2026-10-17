// 更新目前登入使用者的個人資料
// PUT /api/profile

app.put("/api/profile", async (req, res) => {
    try{
        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "login_required"
            });
        }
        // 2. 取得前端送來的資料
        const {
            username,
            email,
            region,
            gender,
            birth,
            bio,
            url
        } = req.body || {};




        // 3. 基本資料驗證
        if(typeof username!=="string"||!username.trim()||username.trim().length>30){
            return res.status(400).json({
                "success":false,
                "message":"使用者名稱不可空白，且最多 30 個字元。"
            });
        }
        if(typeof region!=="string"||!region.trim()||region.trim().length>100){
            return res.status(400).json({
                "success":false,
                "message":"請輸入有效的主要活動區域。"
            });
        }

        const cleanEmail=typeof email==="string"?email.trim():"";
        if(cleanEmail.length>254||(cleanEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))){
            return res.status(400).json({
                "success":false,
                "message":"電子郵件格式不正確。"
            });
        }
        const cleanGender=typeof gender==="string"?gender.trim():"";
        const cleanBio=typeof bio==="string"?bio.trim():"";
        const clean_url=typeof url==="string"?url.trim():"";
        const cleanBirth=typeof birth==="string"?birth.trim():"";
        if(cleanGender.length>20){
            return res.status(400).json({
                "success":false,
                "message":"性別"
            });
        }
        if(cleanBio.length>500){
            return res.status(400).json({
                "success":false,
                "message":"簡介"
            });
        }
        if(clean_url.length>1000){
            return res.status(400).json({
                "success":false,
                "message":"連結的長度超出限制。"
            });
        }
        // 檢查生日格式
        if(cleanBirth){
            const date=new Date(`${cleanBirth}T00:00:00.000Z`);
            if(!/^\d{4}-\d{2}-\d{2}$/.test(cleanBirth)||Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==cleanBirth||cleanBirth>new Date().toISOString().slice(0,10)){
                return res.status(400).json({
                    "success":false,
                    "message":"生日必須是有效的日期，且不能是未來日期。"
                });
            }
        }
        // 4. 更新 Neon PostgreSQL
        const result=await pool.query(
            `
            UPDATE users
            SET
                username = $1,
                email = $2,
                region = $3,
                gender = $4,
                birth = $5::date,
                bio = $6,
                links = $7
            WHERE id = $8
            RETURNING
                id, username, email, region,
                gender, birth, bio, links
            `,
            [
                username.trim(),
                cleanEmail?cleanEmail.toLowerCase():null,
                region.trim(),
                cleanGender||null,
                cleanBirth||null,
                cleanBio||null,
                clean_url,
                userId
            ]
        );
        if(result.rowCount===0){
            return res.status(404).json({
                "success":false,
                "message":"找不到使用者資料。"
            });
        }
        // 5. 回傳儲存後的最新資料
        return res.json({
            "success":true,
            "profile":result.rows[0]
        });

    }
    catch(error){
        if (error.code==="23505") {
            return res.status(409).json({
                "success":false,
                "message":"使用者名稱或電子郵件可能已經被使用。"
            });
        }
        return res.status(500).json({
            "success":false,
            "message":"更新個人資料失敗。"
        });
    }
});