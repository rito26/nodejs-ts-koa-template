import { Context } from "koa-swagger-decorator";
import { ControllerContext } from "../type/context.type";
import * as KoaJwt from "koa-jwt";
import { JwtUtil } from "../util/jwt.util";
import { HttpStatus } from "../type/http.type";
import { ErrorCase, ErrorWithCase, QueryFailError } from "../type/error.type";
import { errorList } from "../common/error-list";
import StateUtil from "../util/state.util";
import { Debug } from "../util/debug.util";
import { controllerState } from "./global-state";
import QueryUtil from "../util/query.util";

export function Controller(target: any, name: string, descriptor: PropertyDescriptor) {

    console.log(`Controller - ${name}`);

    const originDesc = descriptor.value;
    const wrappedMethod = async function (ctx: Context, next: any) {

        // ===================================================================
        //  Middleware : 
        // ===================================================================
        const controllerKey = `${target.name}+${originDesc.name}`;
        const controllerVal = controllerState[controllerKey];
        const sQuery = controllerVal?.Query;
        const sBody = controllerVal?.Body;
        const sParams = controllerVal?.Params;
        const sAtomic = controllerVal?.Atomic;

        // const glob_controller = controllerState;
        // Debug.Log('-=-');

        // ===================================================================
        const headerToken = ctx.header["authorization"];
        const argObj: ControllerContext = {
            ctx: ctx,
            url: ctx.url,
            
            input: {
                ...ctx.request.body,
                ...ctx.request.query,
                ...ctx.params,
            },
            body: ctx.request.body,
            query: ctx.request.query,
            params: ctx.params,
            header: ctx.header,
            hasJwt: headerToken !== undefined,

            ok: (response: any) => {
                ctx.status = 200;
                ctx.body = {
                    success: true,
                    data: response
                };
            },
            fail: (errorCase: ErrorCase) => {
                throw new ErrorWithCase(errorCase);
            },
            failIf: (condition: boolean, errorCase: ErrorCase) => {
                if(condition) {
                    throw new ErrorWithCase(errorCase);
                }
            },
            assertAuth: (a: string, b: string) => {
                if(a != b) {
                    throw new ErrorWithCase("RESTRICTED");
                }
            },
        };
        if(argObj.hasJwt) {
            const jwtData = JwtUtil.Decode(headerToken);
            argObj["jwtPayload"] = jwtData.body;
            argObj["jwtMeta"] = jwtData.meta;
        }

        
        // ===================================================================
        //  Try-Catch + @Atomic 트랜잭션 처리
        // ===================================================================
        const isAtomic = sAtomic === true;
        let isTransactionBegun = false;
        try {
        
            if(isAtomic) {
                // Debug.Log("Begin Transaction");
                isTransactionBegun = await QueryUtil.BeginTransaction();
            }

            await originDesc.call(this, argObj);

            if(isAtomic && isTransactionBegun) {
                // Debug.Log("Commit Transaction");
                await QueryUtil.CommitTransaction();
            }

        } catch (err: any) {

            let resStatus: HttpStatus;
            let resMessage: string;
            let errorCode: string;

            if (err instanceof ErrorWithCase) {
                const errorDetail = errorList[err.errorCase];
                resStatus = errorDetail.status;
                errorCode = errorDetail.code;
                resMessage = errorDetail.msg;
            }
            else if(err instanceof QueryFailError) {
                resStatus = HttpStatus.ServerError;
                resMessage = err.message;
            }
            else if(err instanceof Error) {
                resStatus = HttpStatus.ServerError;
                resMessage = err.message;
                
                if(err.message === "Authentication Error") {
                    const errorDetail = errorList["UNAUTHORIZED"];
                    resStatus = errorDetail.status;
                    errorCode = errorDetail.code;
                    resMessage = errorDetail.msg;
                }
            } 
            else {
                resStatus = HttpStatus.ServerError;
                resMessage = "Internal Unknown Error";
            }

            const ecPrefix = errorCode !== undefined ? `(${errorCode}) ` : "";
            Debug.LogError(`${ecPrefix}${resMessage}`, false);

            if(isAtomic && isTransactionBegun) {
                // Debug.Log("Rollback Transaction");
                await QueryUtil.RollbackTransaction();
            }
            
            // Debug.Log(Color.Cyan(resStatus));
            ctx.status = resStatus;
            ctx.body = {
                success: false,
                message: resMessage,
                errorCode: errorCode,
            };
        }
    };

    descriptor.value = wrappedMethod;
    descriptor.value["funcName"] = originDesc.name;
}