import { logger } from "../shared/utils/logger";

let cors: string[] = [];

if (process.env.NODE_ENV === "development") {
    logger.info("Rodando em ambiente de desenvolvimento");

    cors = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://192.168.56.1",
        "http://192.168.56.1:5173",
        "http://192.168.0.58:8000",
        "http://fme.bongdigital.com.br",
        "https://fme.bongdigital.com.br",
        "https://demo.fme.bongdigital.com.br",
        "http://localhost:5175",
        "http://localhost:5173",
    ];
} else {
    logger.info("Rodando em ambiente de produção");

    cors = [
        "http://fme.bongdigital.com.br",
        "https://fme.bongdigital.com.br",
    ];
}

export default cors;
