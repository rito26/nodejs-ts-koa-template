import { BaseContext } from "koa";
import { Api, Auth, Desc } from "../../decorator/function-decorator";
import { Category } from "../../decorator/class-decorator";
import { ApiContext, ControllerContext } from "../../type/context.type";
import { Controller } from "../../internal/server-custom-middlewares";
import { Debug } from "../../util/debug.util";
import { HttpStatus } from "../../type/http.type";
import { pgConn } from "../../internal/pg-connection";

@Category("General")
export default class GeneralController {

    // @Auth
    @Api("get", "/")
    @Desc("Welcome page", "H I")
    @Controller
    public static async helloWorld(ctx: ControllerContext) {

        // console.log(pgConTest.conn);
        const res = await pgConn.pool.query("SELECT 1 AS _");
        console.log(res.rows[0]);

        ctx.ok("Hello Hello World");

        // Debug.Log(ctx.header);
        // Debug.Log(`Has JWT: ${ctx.hasJwt}`);
        // Debug.Log(ctx.jwtPayload);
        // Debug.Log(ctx.jwtMeta);

        // ctx.fail("SERVER_ERROR");
    }

    // @Auth
    @Api("get", "/h2")
    @Desc("Hello 2")
    @Controller
    public static async helloWorld2(ctx: ControllerContext): Promise<void> {
        
        ctx.ok("Hello Hello");
    }

}