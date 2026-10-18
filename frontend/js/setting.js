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
        document.getElementById("avatar_src").src=data.profile.avatar;
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
async function prepare_avatar(file){
    const allowedTypes=["image/jpeg","image/png","image/webp"];
    if(!allowedTypes.includes(file.type)){
        error(104,"");
        return;
    }
    if(file.size>10*1024*1024){
        error(105,"");
        return;
    }
    const imageSource=await new Promise((resolve,reject)=>{
        const reader = new FileReader();
        reader.onload=()=>resolve(reader.result);
        reader.onerror=()=>reject(error(106,""));
        reader.readAsDataURL(file);
    });
    const image=await new Promise((resolve,reject)=>{
        const img=new Image();
        img.onload=()=>resolve(img);
        img.onerror=()=>reject(error(106,""));
        img.src=imageSource;
    });
    const maxSize=512;
    const scale=Math.min(1,maxSize/Math.max(image.width,image.height));
    const canvas=document.createElement("canvas");
    canvas.width=Math.max(1,Math.round(image.width*scale));
    canvas.height=Math.max(1,Math.round(image.height*scale));
    const context=canvas.getContext("2d");
    if(!context){
        error(107,"");
        return;
    }
    context.drawImage(image,0,0,canvas.width,canvas.height);
    const result=canvas.toDataURL("image/jpeg",0.82);
    if(result.length>1000000){
        error(108,"");
        return;
    }
    return result;
}
document.getElementById("enter").addEventListener("click",async()=>{
    let avatar=document.getElementById("avatar_input").files?.[0];
    let safe_avatar="";
    if(avatar){
        try{
            safe_avatar=await prepare_avatar(avatar);
            document.getElementById("avatar_src").src=safe_avatar;
        }
        catch(err){
            avatar.value="";
            error(109,err.message);
        }
    }
    const info={
        "username":document.getElementById("name").value.trim(),
        "email":document.getElementById("email_text").value.trim(),
        "region":document.getElementById("region_text").value.trim(),
        "gender":document.getElementById("gender_text").value,
        "avatar":safe_avatar,
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
            error(110,"");
            return;
        }
        if(!response.ok||!data.success){
            error(111,data.message);
            return;
        }
        location.href="profile.html";
    }
    catch(err){
        error(112,"");
    }
})
document.getElementById("avatar_input").addEventListener("change",()=>{
    const file=document.getElementById("avatar_input").files?.[0];
    if(!file){
        return;
    }
    document.getElementById("avatar_src").src=URL.createObjectURL(file);
});
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
        document.getElementById("error_msg").innerText="請選擇圖片檔";
    }
    else if(err==105){
        document.getElementById("error_msg").innerText="圖片不能超過 10 MB";
    }
    else if(err==106){
        document.getElementById("error_msg").innerText="讀取圖片失敗";
    }
    else if(err==107){
        document.getElementById("error_msg").innerText="無法處理圖片";
    }
    else if(err==108){
        document.getElementById("error_msg").innerText="圖片太大";
    }
    else if(err==109){
        document.getElementById("error_msg").innerText="圖片處理失敗: "+msg;
    }
    else if(err==110){
        document.getElementById("error_msg").innerText="尚未登入";
    }
    else if(err==111){
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
            document.getElementById("error_msg").innerText="頭像資料格式不正確";
        }
        else if(msg==210){
            document.getElementById("error_msg").innerText="頭像圖片太大";
        }
        else if(msg==211){
            document.getElementById("error_msg").innerText="頭像檔案類型錯誤";
        }
        else if(msg==212){
            document.getElementById("error_msg").innerText="找不到使用者資料";
        }
        else if(msg==213){
            document.getElementById("error_msg").innerText="使用者名稱或電子郵件可能已經被使用";
        }
        else if(msg==214){
            document.getElementById("error_msg").innerText="更新個人資料失敗";
        }
    }
    else if(msg==112){
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