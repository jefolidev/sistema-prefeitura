import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import application from "./config/application";
import expressConfig from "./config/express";
import routes from "./routes";
import { logger } from "./shared/utils/logger";

const app = express();

app.use(express.json());

app.use(cors({ origin: true, credentials: true }));

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
