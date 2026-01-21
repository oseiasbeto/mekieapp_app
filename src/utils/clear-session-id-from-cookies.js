import Cookies from "js-cookie";

const clearSessionIdFromCookies = () => {
    Cookies.remove("session_id")
}

export default clearSessionIdFromCookies