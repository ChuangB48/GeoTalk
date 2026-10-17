// GeoTalk：個人資料編輯功能

const profileForm = document.getElementById("profile-form");
const statusMessage = document.getElementById("status-message");
const saveButton = document.getElementById("save-button");

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const regionInput = document.getElementById("region");
const genderInput = document.getElementById("gender");
const birthInput = document.getElementById("birth");
const bioInput = document.getElementById("bio");
const linksInput = document.getElementById("links");
const bioCount = document.getElementById("bio-count");

// 顯示狀態訊息
function setStatus(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = "status";

    if (type) {
        statusMessage.classList.add(`status-${type}`);
    }
}

// 更新簡介字數
function updateBioCount() {
    bioCount.textContent = `${bioInput.value.length} / 500`;
}

bioInput.addEventListener("input", updateBioCount);

// 取得目前使用者的個人資料
async function loadProfile() {
    setStatus("正在載入個人資料……");

    try {
        const response = await fetch("/api/profile", {
            method: "GET",
            credentials: "same-origin"
        });

        if (response.status === 401) {
            setStatus("請先登入，才能編輯個人資料。");

            const loginLink = document.createElement("a");
            loginLink.href = "login.html";
            loginLink.textContent = "前往登入";
            statusMessage.append(" ", loginLink);

            return;
        }

        const data = await response.json();

        if (!response.ok || !data.success || !data.profile) {
            throw new Error(
                data.message || data.error || "載入個人資料失敗"
            );
        }

        const profile = data.profile;

        // 將資料庫中的值帶入表單
        usernameInput.value = profile.username || "";
        emailInput.value = profile.email || "";
        regionInput.value = profile.region || "";
        bioInput.value = profile.bio || "";
        linksInput.value = profile.links || "";

        // 日期輸入框需要 YYYY-MM-DD 格式
        birthInput.value = profile.birth
            ? String(profile.birth).slice(0, 10)
            : "";

        // 保留資料庫中目前的性別值
        const currentGender = profile.gender || "";
        const genderExists = Array.from(
            genderInput.options
        ).some(option => option.value === currentGender);

        if (currentGender && !genderExists) {
            const option = document.createElement("option");
            option.value = currentGender;
            option.textContent = currentGender;
            genderInput.appendChild(option);
        }

        genderInput.value = currentGender;
        updateBioCount();

        profileForm.hidden = false;
        setStatus("");

    } catch (error) {
        console.error("載入編輯資料失敗：", error);
        setStatus(
            "無法載入個人資料，請重新整理頁面或稍後再試。",
            "error"
        );
    }
}

// 儲存個人資料
profileForm.addEventListener("submit", async event => {
    event.preventDefault();

    // 先做基本檢查
    if (!profileForm.reportValidity()) {
        return;
    }

    const profileData = {
        username: usernameInput.value.trim(),
        email: emailInput.value.trim(),
        region: regionInput.value.trim(),
        gender: genderInput.value,
        birth: birthInput.value,
        bio: bioInput.value.trim(),
        links: linksInput.value.trim()
    };

    saveButton.disabled = true;
    saveButton.textContent = "儲存中……";
    setStatus("正在儲存個人資料……");

    try {
        const response = await fetch("/api/profile", {
            method: "PUT",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(profileData)
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
            setStatus("登入狀態已失效，請重新登入。", "error");
            return;
        }

        if (!response.ok || !data.success) {
            const errorMessages = {
                invalid_username: "使用者名稱不可空白，且最多 30 個字元。",
                invalid_region: "請填寫主要活動區域，最多 100 個字元。",
                invalid_email: "請檢查電子郵件格式。",
                invalid_gender: "性別欄位長度不符合要求。",
                invalid_birth: "請輸入有效且非未來的生日。",
                bio_too_long: "個人簡介最多 500 個字元。",
                links_too_long: "個人連結最多 1000 個字元。",
                duplicate_value: "使用者名稱或電子郵件可能已被其他帳號使用。"
            };

            const message =
                data.message ||
                errorMessages[data.error] ||
                "儲存失敗，請檢查資料後重試。";

            setStatus(message, "error");
            return;
        }

        // 用後端回傳的最新資料更新表單
        const saved = data.profile;

        usernameInput.value = saved.username || "";
        emailInput.value = saved.email || "";
        regionInput.value = saved.region || "";
        genderInput.value = saved.gender || "";
        birthInput.value = saved.birth
            ? String(saved.birth).slice(0, 10)
            : "";
        bioInput.value = saved.bio || "";
        linksInput.value = saved.links || "";

        updateBioCount();
        setStatus("儲存成功！正在返回個人檔案……", "success");

        // 返回檢視頁
        window.setTimeout(() => {
            window.location.href = "profile.html";
        }, 800);

    } catch (error) {
        console.error("儲存個人資料失敗：", error);
        setStatus("連線失敗，請檢查網路或稍後再試。", "error");

    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "儲存變更";
    }
});

// 頁面載入時讀取資料
loadProfile();