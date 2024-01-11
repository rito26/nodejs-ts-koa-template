import { Context } from "koa";
import { validate, ValidationError } from "class-validator";
import { Auth, Api, Desc, Responses, Atomic, Params, Query, Body } from "../../../decorator/function-decorator";
import { Category, Prefix } from "../../../decorator/class-decorator";
import { Controller } from "../../../internal/server-custom-middlewares";
import { ControllerContext } from "../../../type/context.type";
import { UserService } from "../service/user.service";
import { HttpStatus } from "../../../type/http.type";
import { Debug } from "../../../util/debug.util";

type User = {
    id: string;
    name: string;
}

// @responsesAll({ 
//     100: { description: "aa"}, 
//     200: { description: "success"}, 
//     400: { description: "bad request"}, 
//     401: { description: "unauthorized, missing/wrong jwt token"}
// })
@Prefix("/v1")
@Category("User")
export default class UserController {

    /**
     * 모든 유저 조회
     * @author 작성자
     * @date 2023. 12. 27
     */
    @Auth
    @Desc("모든 유저 조회", "설명설명")
    @Api("get", "/users")
    // @responses({ 123: { description: "success"}, 505: { description: "error"}})
    @Responses({ 123: "success", 501: "Error"})
    @Atomic
    @Controller
    public static async GetUsers(ctx: ControllerContext): Promise<void> {
        // console.log("Controller - Begin");

        const users = await UserService.FindAll();
        ctx.ok(users);

        Debug.Log("aaa");

        // console.log(ctx);
        // console.log("Controller - End");
    }

    // @Auth
    @Desc("유저 조회")
    @Api("get", "/users/{id}")
    @Params({
        id: { type: "number", required: true, description: "아아아아아아이이이디" }
    })
    @Controller
    public static async GetUser(ctx: ControllerContext): Promise<void> {

        Debug.Log(ctx.params);
        const res = await UserService.Find(ctx.params.id);
        ctx.ok(res);

        // console.log(ctx);
    }

    @Auth
    @Atomic
    @Api("post", "/user")
    @Desc("회원가입")
    @Body({
        loginId: {
            type: "string",
            description: "로그인 아이디",
            default: "testUser001",
        },
        nickname: {
            type: "string",
            description: "닉네임",
            default: "testNick001",
        },
        pwd: {
            type: "string",
            description: "비밀번호",
            default: "1234",
        },
    })
    @Controller
    public static async AddUser(ctx: ControllerContext): Promise<void> {

        const res = await UserService.Insert(ctx.body as any);
        ctx.ok("ok");
    }

    // @Auth
    @Api("patch", "/user/nick")
    @Desc("사용자 닉네임 변경")
    @Query({
        loginId: {
            type: "string",
            description: "로그인 아이디",
            default: "idid",
        },
        nickname: {
            type: "string",
            description: "닉네임",
            required: true,
        },
    })
    @Controller
    public static async UpdateUserNickname(ctx: ControllerContext): Promise<void> {

        const resFind = await UserService.FindByLoginId(ctx.input.loginId);
        ctx.failIf(resFind.length === 0, "USER_NOT_FOUND");

        Debug.Log(ctx.jwtPayload);
        // ctx.assertAuth(ctx.jwtPayload.id, ctx.input.loginId);
        ctx.assertAuth("testUser01123", ctx.input.loginId);
        
        const userData = resFind[0];
        await UserService.UpdateNickname({
            userIdx: userData.userIdx,
            nickname: ctx.input.nickname
        });
        
        ctx.ok("ok");
    }

    // @Auth
    @Api("patch", "/user/pwd")
    @Desc("사용자 비밀번호 변경")
    @Body({
        loginId: {
            type: "string",
            description: "로그인 아이디",
        },
        pwd: {
            type: "string",
            description: "수정할 비밀번호",
        },
    })
    @Controller
    public static async UpdateUserPassword(ctx: ControllerContext): Promise<void> {

        const resFind = await UserService.FindByLoginId(ctx.body.loginId);
        ctx.failIf(resFind.length === 0, "USER_NOT_FOUND");

        ctx.assertAuth(ctx.jwtPayload.id, ctx.body.loginId);
        await UserService.Delete(resFind[0].userIdx);
        ctx.ok("ok");
    }
}
