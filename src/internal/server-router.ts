import Koa from "koa";
import Router from "@koa/router";
import { SwaggerRouter } from "koa-swagger-decorator";
import { HttpMethod, HttpStatus } from "../type/http.type";
import jwt from "koa-jwt";
import { Config } from "../config/config";
import { registerRoutes } from "../routes";
import { ClassType } from "../type/common.type";
import { controllerState } from "./global-state";
import StateUtil from "../util/state.util";
import { ErrorWithCase, QueryFailError } from "../type/error.type";
import { Debug } from "../util/debug.util";
import { Color } from "../util/color.util";
import { errorList } from "../common/error-list";
import { applyServerMiddlewares } from "./server-middlewares";

type ControllerFuncSrc = (args: any) => Promise<any>;
type ControllerFunc = 
    ControllerFuncSrc & { 
        path: string;
        method: HttpMethod;
        auth: boolean | undefined;
    };

// 통합 라우터 (싱글톤)
export class ServerRouter
{
    private static singleton: ServerRouter;
    private protectedRouter: SwaggerRouter;
    private unprotectedRouter: Router;

    private constructor() {
        this.protectedRouter = new SwaggerRouter();
        this.unprotectedRouter = new Router();
    }

    private static checkInst(): void {
        if(this.singleton == null) // null or undefined
        {
            this.singleton = new ServerRouter();
        }
    }

    public static Init(app: Koa, config: Config, dir: string): void {
        this.checkInst();

        registerRoutes();

        const pro = this.singleton.protectedRouter;
        const unpro = this.singleton.unprotectedRouter;

        pro.swagger({
            title: "ATS BE",
            description: "ATS Backend (KOA)",
            version: "1.0.0",
            swaggerHtmlEndpoint: "/swagger",
            swaggerJsonEndpoint: "/swagger.json"
        });
        
        pro.mapDir(dir);

        applyServerMiddlewares(app); // 커스텀 미들웨어 적용
        app.use(unpro.routes())
           .use(unpro.allowedMethods());
        app.use(jwt({ secret: config.jwtSecret })
                .unless({ 
                    path: [/^\/swagger/]
                })
            );
        app.use(pro.routes())
           .use(pro.allowedMethods());
    }

    /**
     * 컨트롤러 함수 라우팅 등록
     */
    public static register(func: ControllerFunc | any) {
        this.checkInst();
        const f = func as ControllerFunc;

        // console.log(f.auth);
        // if ((f.auth === true)) return;
        // if (controllerState[])
        // console.log(f.path);
        // Debug.Log(func);

        if(f.path != null) {
            f.path = f.path.replace("{", ":").replace("}", "");
            if(func.prefix != null ){
                f.path = func.prefix + f.path;
            }
        }

        const router = this.singleton.unprotectedRouter;
        // Debug.Log(func.prefix);

        switch(f.method) {
            case "get": router.get(f.path, f); break;
            case "post": router.post(f.path, f); break;
            case "put": router.put(f.path, f); break;
            case "patch": router.patch(f.path, f); break;
            case "delete": router.delete(f.path, f); break;
        }
    }

    /**
     * 컨트롤러 내의 모든 메소드 라우팅 등록
     */
    public static registerController(classType: ClassType) {
        
        const c = classType as any;

        // Debug.DeepLog(classType);
        // Debug.Log(c.prefix);

        const methods = 
            Object.getOwnPropertyNames(c)
            .filter((v) => 
                v !== "name" && v !== "length" && v !== "prototype" && v !== "prefix")
            .map((mn) => c[mn]);

        for(const method of methods) {
            if(c.prefix != null) {
                method.prefix = c.prefix;
            }
            
            const m = method;

            // ControllerState에 키가 존재할 경우, ContextState로 복사
            // const csKey = `${c.name}+${m.name}`;
            const csKey = `${c.name}+${m.funcName}`;
            const csValue = controllerState[csKey];

            // ContextState 폐기
            // if(csValue != null) {
            //     const xsKey = `${m.method}+${m.path}`;
            //     contextState[xsKey] = csValue;
            // }
            
            // Debug.Log(csKey, csValue?.Auth);
            if(csValue?.Auth === undefined) 
            {
                this.register(method);
                // Debug.Log(csKey, csValue?.Auth);
            }
        }
    }
}
