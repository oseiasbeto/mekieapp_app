import Cookies from "js-cookie";

const setSessionIdFronCookies = (session_id) => {
    const sessionId = String(session_id)
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getFullYear() + 1);
    Cookies.set("session_id", sessionId, {
        secure: false,
        saneSite: "Strict",
        expires: expirationDate
    })
}

export default setSessionIdFronCookies