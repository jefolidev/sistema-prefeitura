import "../bootstrap";
import { logger } from "../shared/utils/logger";

export default({
    url: process.env.URL_REDIS || (() => {
        logger.error("URL_REDIS não foi definida");
        process.exit();
    })()
});