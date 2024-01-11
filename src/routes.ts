import { responsesAll } from "koa-swagger-decorator";
import GeneralController from "./api/general";
import UserController from "./api/user/controller/user.controller";
import { ServerRouter } from "./internal/server-router";

export function registerRoutes() {

    ServerRouter.registerController(GeneralController);
    ServerRouter.registerController(UserController);
    
}
