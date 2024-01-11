import Koa from "koa";
import StateUtil from "../util/state.util";
import { HttpStatus } from "../type/http.type";
import { ErrorWithCase, QueryFailError } from "../type/error.type";
import { errorList } from "../common/error-list";
import { Debug } from "../util/debug.util";
import { controllerState } from "./global-state";

export function applyServerMiddlewares(app: Koa) {
    // ==============================================================
    //  MiddleWare : @Auth: JWT 'Bearer ' 없는 경우 처리 
    // ==============================================================
    app.use(async (ctx, next) => {
        const at = ctx.headers.authorization;
        if(at !== undefined) {
            if(at.startsWith("bearer")) {
                ctx.headers.authorization = at.replace("bearer", "Bearer");
            }
            if(!at.startsWith("Bearer")) {
                ctx.headers.authorization = `Bearer ${at}`;
            }
        }
        await next();
    });
    // // ==============================================================
    // //  MiddleWare : Query, Param, Body - 타입 변환
    // // ==============================================================
    // app.use(async (ctx, next) => {
        
    //     const q = StateUtil.GetState(ctx, 'Query');
    //     const b = StateUtil.GetState(ctx, 'Body');
    //     const p = StateUtil.GetState(ctx, 'Query');
    //     const glob_controller = controllerState;
    //     const glob_context = contextState;
    //     ''
    //     // Debug.Log(ctx);
    //     Debug.Log("Middle Ware");
    //     // Debug.Log(ctx.res);
    //     // Debug.Log(ctx.funcName);
    //     // Debug.Log(ctx.prototype.routerPath);
    //     // Debug.Log("ASDF", ctx['_matchedRoute']); // undef

    //     await next();
    // });
    // ==============================================================
    //  MiddleWare : Try-Catch, Annotations (@Atomic, )
    // ==============================================================
    // app.use(async (ctx, next) => {
    // });
}