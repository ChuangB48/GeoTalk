document.getElementById("logo_text").addEventListener("click",()=>{
    location.href="lobby.html";
});
async function loadProfile(){
    try{
        const response=await fetch("/api/profile",{
            method:"GET",
            credentials:"same-origin"
        });
        if(response.status===401){
            error(101,"");
            return;
        }
        const data=await response.json();
        if(!response.ok||!data.success||!data.profile){
            error(102,data.error);
            return;
        }
        document.getElementById("avatar").innerHTML="<img id='avatar_src' src="+data.profile.avatar+">"
        document.getElementById("name").value=data.profile.username;
        if(data.profile.url!==null&&data.profile.url!==undefined&&data.profile.url.trim()!==""){
            document.getElementById("url").value=data.profile.url;
        }
        document.getElementById("bio_text").value=data.profile.bio;
        document.getElementById("email_text").value=data.profile.email;
        document.getElementById("region_text").value=data.profile.region;
        document.getElementById("birth_text").value=data.profile.birth;
        document.getElementById("gender_text").value=data.profile.gender;
    }
    catch(error){
        error(103,err);
    }
}
document.getElementById("enter").addEventListener("click",async()=>{
    const info={
        "username":document.getElementById("name").value.trim(),
        "email":document.getElementById("email_text").value.trim(),
        "region":document.getElementById("region_text").value.trim(),
        "gender":document.getElementById("gender_text").value,
        "birth":document.getElementById("birth_text").value,
        "bio":document.getElementById("bio_text").value.trim(),
        "url":document.getElementById("url").value.trim()
    };
    try{
        const response=await fetch("/api/profile",{
            method:"PUT",
            credentials:"same-origin",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(info)
        });
        const data=await response.json().catch(()=>({}));
        if(response.status===401){
            error(104,"");
            return;
        }
        if(!response.ok||!data.success){
            error(105,data.message);
            return;
        }
        location.href="profile.html";
    }
    catch(err){
        error(106,"");
    }
})
function error(err,msg){
    document.getElementById("error_board").style.zIndex="1";
    document.getElementById("error_board").style.opacity="0";
    let a=0;
    let time=window.setInterval(()=>{
        document.getElementById("error_board").style.opacity=a.toString();
        a+=0.1
        if(a>=0.9){
            window.clearInterval(time);
        }
    },20)
    if(err==101){
        document.getElementById("error_msg").innerText="尚未登入";
    }
    else if(err==102){
        if(msg==201){
            document.getElementById("error_msg").innerText="尚未登入";
        }
        else if(msg==202){
            document.getElementById("error_msg").innerText="未找到使用者";
        }
        else if(msg==203){
            document.getElementById("error_msg").innerText="伺服器錯誤";
        }
    }
    else if(err==103){
        document.getElementById("error_msg").innerText="伺服器錯誤: "+msg;
    }
    else if(err==104){
        document.getElementById("error_msg").innerText="尚未登入";
    }
    else if(err==105){
        if(msg==201){
            document.getElementById("error_msg").innerText="尚未登入";
        }
        else if(msg==202){
            document.getElementById("error_msg").innerText="使用者名稱不可空白，且最多 30 個字元";
        }
        else if(msg==203){
            document.getElementById("error_msg").innerText="選擇表單內的地區";
        }
        else if(msg==204){
            document.getElementById("error_msg").innerText="電子郵件格式不正確";
        }
        else if(msg==205){
            document.getElementById("error_msg").innerText="選擇表單內性別";
        }
        else if(msg==206){
            document.getElementById("error_msg").innerText="個人簡介需在500字以內";
        }
        else if(msg==207){
            document.getElementById("error_msg").innerText="連結需在1000字以內";
        }
        else if(msg==208){
            document.getElementById("error_msg").innerText="生日必須是有效的日期，且不能是未來日期";
        }
        else if(msg==209){
            document.getElementById("error_msg").innerText="找不到使用者資料";
        }
        else if(msg==210){
            document.getElementById("error_msg").innerText="使用者名稱或電子郵件可能已經被使用";
        }
        else if(msg==211){
            document.getElementById("error_msg").innerText="更新個人資料失敗";
        }
    }
    else if(msg==106){
        document.getElementById("error_msg").innerText="連線失敗";
    }
    window.setTimeout(()=>{
        if(document.getElementById("error_board").style.opacity>"0"){
            document.getElementById("error_board").style.opacity="0.9";
            a=0.9;
            let time=window.setInterval(()=>{
                document.getElementById("error_board").style.opacity=a.toString();
                a-=0.1
                if(a<=0){
                    document.getElementById("error_board").style.zIndex="-1";
                    document.getElementById("error_board").style.opacity="0";
                    window.clearInterval(time);
                }
            },20)
        }
    },5000);
}
loadProfile();