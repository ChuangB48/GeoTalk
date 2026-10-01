document.getElementById("create").addEventListener("click", async () => {
    document.getElementById("username_error").style.opacity = "0";
    document.getElementById("password_error").style.opacity = "0";
    document.getElementById("confirm_error").style.opacity = "0";
    document.getElementById("error").style.opacity = "0";
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
    if (document.getElementById("password_input").value !== document.getElementById("confirm_input").value) {
        err(3);
        return;
    }
    try {
        const response = await fetch(
            "http://localhost:3000/api/register",
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
        if (!response.ok) {
            err(data.message || "Registration failed.");
            return;
        }
        setTimeout( () => {
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
document.getElementById("visionable_confirm").addEventListener("mousedown", () => {
    document.getElementById("confirm_input").type = "text";
    document.getElementById("visionable_confirm").src = "images/visionable.png";
});
document.getElementById("visionable_confirm").addEventListener("mouseup", () => {
    document.getElementById("confirm_input").type = "password";
    document.getElementById("visionable_confirm").src = "images/invisionable.png";
});
function err (msg) {
    document.getElementById("error").style.opacity = "1";
    if (msg == 0) {
        document.getElementById("error_text").innerText = "Please enter your username and password.";
        document.getElementById("username_error").style.opacity = "1";
        document.getElementById("password_error").style.opacity = "1";
    }
    else if (msg == 1) {
        document.getElementById("error_text").innerText = "Please enter your username.";
        document.getElementById("username_error").style.opacity = "1";
    }
    else if (msg == 2) {
        document.getElementById("error_text").innerText = "Please enter your password.";
        document.getElementById("password_error").style.opacity = "1";
    }
    else if (msg == 3) {
        document.getElementById("error_text").innerText = "Passwords do not match.";
        document.getElementById("confirm_error").style.opacity = "1";
    }
    else {
        document.getElementById("error_text").innerText = msg;
        document.getElementById("password_error").style.opacity = "1";
    }
}