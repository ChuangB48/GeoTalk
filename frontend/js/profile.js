document.getElementById("logo_text").addEventListener("click",()=>{
    location.href="lobby.html";
});
function display(value){
    if(value===null||value===undefined||value.trim()===""){
        return "尚未設定";
    }
    return value;
}
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
        document.getElementById("name").innerText=data.profile.username;
        if(data.profile.url!==null&&data.profile.url!==undefined&&data.profile.url.trim()!==""){
            document.getElementById("url").href=data.profile.url;
            document.getElementById("url").innerText=display(data.profile.url);
        }
        document.getElementById("bio_text").innerText=display(data.profile.bio);
        document.getElementById("email_text").innerText=display(data.profile.email);
        document.getElementById("region_text").innerText=display(data.profile.region);
        document.getElementById("birth_text").innerText=display(data.profile.birth);
        document.getElementById("gender_text").innerText=display(data.profile.gender);
    }
    catch(err){
        error(103,err);
    }
}
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