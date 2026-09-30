document.getElementById("enter").addEventListener("click", async () => {
    document.getElementById("username_error").style.opacity  =  "0";
    document.getElementById("password_error").style.opacity  =  "0";
    document.getElementById("error").style.opacity  =  "0";
    if (!document.getElementById("username_input").value || !document.getElementById("password_input").value) {
        if (!document.getElementById("username_input").value && !document.getElementById("password_input").value) {
            err(0);
        }
        else if (!document.getElementById("username_input").value) {
            err(1);
        }
        else if (!document.getElementById("password_input").value) {
            err(2);
        }
        return;
    }
    try {
        const response = await fetch(
            "http://localhost:3000/api/login",
            {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                    "username" : document.getElementById("username_input").value,
                    "password" : document.getElementById("password_input").value
                })
            }
        );
        const data = await response.json();
        if(!response.ok){
            err(data.message || "Registration failed.");
            return;
        }
        setTimeout(() => {
            window.location.href = "login.html";
        },1500);
    }
    catch (error) {
        err(error);
    }
});
document.getElementById("visionable").addEventListener("mousedown", () => {
    document.getElementById("password_input").type = "text";
    document.getElementById("visionable").src = "images/visionable.png";
});
document.getElementById("visionable").addEventListener("mouseup", () => {
    document.getElementById("password_input").type = "password";
    document.getElementById("visionable").src = "images/invisionable.png";
});
function err (msg) {
    document.getElementById("error").style.opacity = "1";
    if (msg == 0) {
        document.getElementById("error_span").innerText = "Please enter your username and password.";
        document.getElementById("username_error").style.opacity = "1";
        document.getElementById("password_error").style.opacity = "1";
    }
    else if (msg == 1) {
        document.getElementById("error_span").innerText = "Please enter your username.";
        document.getElementById("username_error").style.opacity = "1";
    }
    else if (msg == 2) {
        document.getElementById("error_span").innerText = "Please enter your password.";
        document.getElementById("password_error").style.opacity = "1";
    }
    else {
        document.getElementById("error_span").innerText = msg;
        document.getElementById("password_error").style.opacity = "1";
    }
}
document.getElementById("signup").addEventListener("click", () => {
    window.location.href = "register.html";
});