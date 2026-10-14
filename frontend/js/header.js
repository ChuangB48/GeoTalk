async function loadCurrentUser(){
    try{
        const response=await fetch("/api/me");
        const data=await response.json();
        if(response.ok){
            document.getElementById("username_text").textContent=data.user.username;
            console.log("Current user:",data.user);
        }
        else{
            document.getElementById("username_text").textContent="尚未登入";
            console.log("User is not logged in.");
        }
    }
    catch(error){
        console.error("Failed to load current user:",error);
        document.getElementById("username_text").textContent="尚未登入";
    }
}
document.getElementById("logo_text").addEventListener("click",()=>{
    location.href="lobby.html";
});