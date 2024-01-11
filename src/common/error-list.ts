import { HttpStatus } from "../type/http.type";

const errorList = 
{
    // ======================================================
    // Default
    // ======================================================
    SERVER_ERROR: {
        code: "S0001",
        status: HttpStatus.ServerError,
        msg: "Internal Server Error",
    },

    // ======================================================
    // Authorization
    // ======================================================
    UNAUTHORIZED : {
        code: "A0001",
        status: HttpStatus.Unauthorized,
        msg: "인증이 필요합니다",
    },
    
    RESTRICTED : {
        code: "A0002",
        status: HttpStatus.Forbidden,
        msg: "접근 권한이 없습니다",
    },

    // ======================================================
    // USER
    // ======================================================
    USER_NOT_FOUND : {
        code: "U0001",
        status: HttpStatus.NotFound,
        msg: "존재하지 않는 사용자입니다",
    },

    DUPLICATE_LOGIN_ID : {
        code: "U0002",
        status: HttpStatus.Conflict,
        msg: "이미 존재하는 ID입니다",
    },

    DUPLICATE_USER_NICKNAME : {
        code: "U0003",
        status: HttpStatus.Conflict,
        msg: "이미 존재하는 닉네임입니다",
    },

} as const;

export { errorList };