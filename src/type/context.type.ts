import Koa from "koa";
import { Context } from "koa-swagger-decorator";
import { JwtBody, JwtMeta } from "./jwt.type";
import { HttpStatus } from "./http.type";
import { ErrorCase } from "./error.type";

export type MiddleWareContext = 
    Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>;

export interface ApiContext extends Context {
    
}

export type ControllerContext = {
    url: string;

    /** Body + Query + Params */
    input: Record<string, any>;

    body: Record<string, any>;
    query: Record<string, any>;
    params: Record<string, any>;
    header: Record<string, any>;

    hasJwt: boolean;
    jwtPayload?: JwtBody;
    jwtMeta?: JwtMeta;

    ok: (response: any) => void;
    fail: (errorCase: ErrorCase) => void;
    
    /** condition이 true일 경우 에러 처리 */
    failIf: (condition: boolean, errorCase: ErrorCase) => void;

    /** 두 ID를 비교하여, 일치하지 않는 경우 403 에러 처리 */
    assertAuth: (firstId: string, secondID: string) => void;

    // fail: (status: HttpStatus, message: string) => void;
    // throw: (message: string) => void;

    ctx: Context;
}
