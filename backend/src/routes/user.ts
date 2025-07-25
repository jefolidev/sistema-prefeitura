import { Router } from "express";
import { body } from "express-validator";
import { getAllServidores, getAllUsers, getUserById, login, logout, myAccount, register, registerServidor, toggleSuperUser } from "../controllers/UserControllers";

const userRoutes = Router();

userRoutes.get("/", getAllUsers);

userRoutes.get("/servidores", getAllServidores);

userRoutes.get(
    "/id/:id",
    [
        body("id").isUUID().withMessage("id"),
    ],
    getUserById
);

userRoutes.post(
    "/register",
    [
        body("name").isString().withMessage("name"),
        body("surname").isString().withMessage("surname"),
        body("user").isLength({
            min: 6,
            max: 25
        }).withMessage("user"),
        body("email").isEmail().withMessage("email"),
        body("password").isLength({
            min: 6,
            max: 20
        }).withMessage("password"),
        body("cpf").isLength({
            min: 11,
            max: 11
        }).withMessage("cpf")
    ],
    register
);

userRoutes.post(
    "/register-servidor",
    [
        body("name").isString().withMessage("name"),
        body("surname").isString().withMessage("surname"),
        body("cpf").isLength({
            min: 11,
            max: 11
        }).withMessage("cpf")
    ],
    registerServidor
);

userRoutes.post(
    "/login",
    [
        body("user").isString().withMessage("user"),
        body("senha").isString().withMessage("senha"),
    ],
    login
);

userRoutes.post(
    "/logout",
    logout
);

userRoutes.patch("/toggleSuperUser/:id", toggleSuperUser);

userRoutes.post(
    "/myaccount",
    myAccount
);

export default userRoutes;