import { NextFunction, Request, Response } from "express";
import redis from "../database/redis";
import { verify } from "jsonwebtoken";
import auth from "../../config/auth";

interface CustomHeaders {
  "x-access-token"?: string;
}

interface requestIndex extends Request{
    headers: Request["headers"] & CustomHeaders;
};

const isAuth = async (req: requestIndex, res: Response, next: NextFunction) => {
    const authHeader:string|undefined = req.headers["x-access-token"] as string | undefined;

    /////Caso o header não exista mas a rota seja de login, permitir o acesso
    if (!authHeader) {

        if(req.path.includes("login")){
            next();
            return;
        };

        res.status(401).json({ error: "Acesso Não Autorizado" });
        return;

    };

    const [, token] = authHeader.split(" ");

    ////Verificar se o token está na blacklist, se estiver, não permitir o acesso
    const blacklist = await redis.get("blacklist:"+token);
    if(blacklist){

        if(req.path.includes("login")){
            next();
            return;
        };

        res.status(401).json({ error: "Acesso Não Autorizado" });
        return;
    };

    try {
        ////decodifica o token e captura os dados do usuário
        verify(token, auth.secret);
        
        //mas caso a rota seja de login, não permitir o acesso ja que o usuário já está logado
        if(req.path.includes("login")){
            res.status(401).json({ error: "Acesso Não Autorizado" });
            return;
        };
    } catch {
        ///Se cair nesse bloco é porque o token é inválido, então não permitir o acesso
        //mas caso a rota seja de login, permitir o acesso
        if(req.path.includes("login")){
            next();
            return;
        };
        res.status(401).json({ error: "Acesso Não Autorizado" });
        return;
    }

    next();
};

export default isAuth;