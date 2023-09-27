// get authToken from cookie
export function getAuthTokenFromCookie() {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "authToken") {
            return value;
        }
    }
    return null;
}

// get userId from sessionStorage
export function getUserIdFromSession() {
    return sessionStorage.getItem("userId") || "";
}

// save userId in sessionStorage
export function saveUserIdInSession(userId) {
    // set expire time to 1h
    // document.cookie = `authToken=${token}; SameSite=Strict; Max-Age=3600`;
    // document.cookie = `userId=${userId}; SameSite=Strict; Max-Age=3600`;
    sessionStorage.setItem("userId", userId);
}

// remove userId from sessionStorage
export function deleteUserIdInSession() {
    // document.cookie = `authToken=; SameSite=Strict; Max-Age=-9999`;
    // document.cookie = `userId=; SameSite=Strict; Max-Age=-9999`;
    sessionStorage.removeItem("userId");
}
