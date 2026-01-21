import { jwtDecode } from "jwt-decode";
import { logger } from "./logger";

const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        logger.error("Erro ao decodificar o token:", error);
        return null;
    }
}

export default decodeToken