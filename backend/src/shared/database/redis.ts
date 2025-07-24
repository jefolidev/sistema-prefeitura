import { Redis } from "ioredis";
import redis_config from "../../config/redis";
import { logger } from "../utils/logger";

// Configuração da conexão ao Redis com reconexão automática
const redis = new Redis(redis_config.url, {
    retryStrategy: (times:number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    keyPrefix: "fme-xingu:",
});

// Evento de conexão bem-sucedida
redis.on("connect", () => {
    logger.info("Conectado ao Redis com sucesso!");
});

// Evento de erro
redis.on("error", (err:Error) => {
    logger.error("Erro ao conectar ao Redis:", err);
});

// Evento de reconexão
redis.on("reconnecting", (times:number) => {
    logger.info(`Tentando reconectar ao Redis (${times}ª tentativa)...`);
});

export default redis;