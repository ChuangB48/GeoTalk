async function regist(){
    document.getElementById("username_error").style.opacity="0";
    document.getElementById("password_error").style.opacity="0";
    document.getElementById("confirm_error").style.opacity="0";
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
    if(document.getElementById("password_input").value!==document.getElementById("confirm_input").value){
        error(104);
        return;
    }
    try{
        const response=await fetch(
            "/api/register",
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
            error(105,data.message);
            return;
        }
        window.location.href="login.html";
    }
    catch(err){
        error(106,err);
    }
}
document.getElementById("create").addEventListener("click",regist);
document.addEventListener("keydown",event=>{
    if(event.key=="Enter"){
        regist();
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
document.getElementById("visionable_confirm").addEventListener("mousedown",()=>{
    document.getElementById("confirm_input").type="text";
    document.getElementById("visionable_confirm").src="images/visionable.png";
});
document.getElementById("visionable_confirm").addEventListener("mouseup",()=>{
    document.getElementById("confirm_input").type="password";
    document.getElementById("visionable_confirm").src="images/invisionable.png";
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
        document.getElementById("error_msg").innerText="密碼與確認密碼不一致";
        document.getElementById("confirm_error").style.opacity="1";
    }
    else if(err==105){
        if(msg==201){
            document.getElementById("error_msg").innerText="使用者名稱或密碼不接受";
        }
        else if(msg==202){
            document.getElementById("error_msg").innerText="使用者名稱須超過2個字";
        }
        else if(msg==203){
            document.getElementById("error_msg").innerText="使用者名稱不能超過50個字";
        }
        else if(msg==204){
            document.getElementById("error_msg").innerText="密碼須超過5個字";
        }
        else if(msg==205){
            document.getElementById("error_msg").innerText="使用者名稱已被使用";
        }
        else if(msg==206){
            document.getElementById("error_msg").innerText="伺服器錯誤";
        }
    }
    else if(err==106){
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