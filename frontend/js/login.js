async function login(){
    document.getElementById("username_error").style.opacity="0";
    document.getElementById("password_error").style.opacity="0";
    document.getElementById("error_board").style.opacity="0";
    if(!document.getElementById("username_input").value||!document.getElementById("password_input").value){
        if(!document.getElementById("username_input").value&&!document.getElementById("password_input").value){
            error(101,"");
        }
        else if(!document.getElementById("username_input").value){
            error(102,"");
        }
        else if(!document.getElementById("password_input").value){
            error(103,"");
        }
        return;
    }
    try {
        const response=await fetch(
            "/api/login",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    "username":document.getElementById("username_input").value,
                    "password":document.getElementById("password_input").value
                })
            }
        );
        const data=await response.json();
        if(!response.ok){
            error(104,data.message);
            return;
        }
        window.location.href="lobby.html";
    }
    catch(err){
        error(105,err);
    }
}
document.getElementById("enter").addEventListener("click",login);
document.addEventListener("keydown",(event)=>{
    if(event.key=="Enter"){
        login();
    }
})
document.getElementById("visionable").addEventListener("mousedown",()=>{
    document.getElementById("password_input").type="text";
    document.getElementById("visionable").src="images/visionable.png";
});
document.getElementById("visionable").addEventListener("mouseup",()=>{
    document.getElementById("password_input").type="password";
    document.getElementById("visionable").src="images/invisionable.png";
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
        document.getElementById("error_msg").innerText="輸入使用者名稱與密碼";
        document.getElementById("username_error").style.opacity="1";
        document.getElementById("password_error").style.opacity="1";
    }
    else if(err==102){
        document.getElementById("error_msg").innerText="輸入使用者名稱";
        document.getElementById("username_error").style.opacity="1";
    }
    else if(err==103){
        document.getElementById("error_msg").innerText="輸入密碼";
        document.getElementById("password_error").style.opacity="1";
    }
    else if(err==104){
        if(msg==201){
            document.getElementById("error_msg").innerText="使用者名稱或密碼不接受";
        }
        else if(msg==202){
            document.getElementById("error_msg").innerText="使用者未找到";
        }
        else if(msg==203){
            document.getElementById("error_msg").innerText="密碼錯誤";
        }
        else if(msg==204){
            document.getElementById("error_msg").innerText="伺服器錯誤";
        }
    }
    else if(err==105){
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
document.getElementById("signup").addEventListener("click",()=>{
    window.location.href="register.html";
});