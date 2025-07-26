import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import application from "./config/application";
import { getAllowedOrigins } from "./config/cors";
import expressConfig from "./config/express";
import routes from "./routes";
import { logger } from "./shared/utils/logger";

const app = express();

app.use(express.json());

const allowedOrigins = getAllowedOrigins();

if (allowedOrigins === "*") {
    app.use(cors({ origin: true, credentials: true }));
} else {
    app.use(cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("CORS não permitido"));
        },
        credentials: true,
    }));
}

app.use(routes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack);
    res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        error: application.type === "development" ? err.message : "An error occurred",
    });
});

app.listen(expressConfig.port, () => {
    logger.info(`Server is running on port ${expressConfig.port}`);
    logger.info(`Backend URL: ${expressConfig.urlBackend}`);
});
