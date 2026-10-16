async function loadCurrentUser(){
    try{
        const response=await fetch("/api/me");
        const data=await response.json();
        if(response.ok){
            document.getElementById("avatar").innerHTML="<img src='"+data.user.username+"' id='avatar_pic'>";
            document.getElementById("username_text").textContent=data.user.username;
        }
        else{
            document.getElementById("avatar").innerHTML="<div id='non_login'><span id='non_login_text'>尚未登入</span></div>";
            document.getElementById("username_text").textContent="尚未登入";
        }
    }
    catch(error){
        console.error("Failed to load current user:",error);
        document.getElementById("avatar").innerHTML="<div id='non_login'><span id='non_login_text'>尚未登入</span></div>";
        document.getElementById("username_text").textContent="尚未登入";
    }
}
document.getElementById("logo_text").addEventListener("click",()=>{
    location.href="lobby.html";
});
document.getElementById("personal").addEventListener("click",()=>{
    location.href="profile.html";
});