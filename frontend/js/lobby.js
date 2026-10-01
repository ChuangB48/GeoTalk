async function loadCurrentUser() {
    try {
        const response = await fetch("/api/me");
        const data = await response.json();
        if (!response.ok) {
            window.location.href = "login.html";
            return;
        }
        document.getElementById("username_text").textContent = data.user.username;
        console.log(
            "Current user:",
            data.user
        );
    }
    catch (error) {
        console.error("Failed to load current user:",error);
        document.getElementById("username_text").textContent = "Error";
    }
}
loadCurrentUser();