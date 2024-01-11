import { ErrorCase, ErrorWithCase } from "../../../type/error.type";
import { ExtractOutputFromQuery } from "../../../type/sql.type";
import QueryUtil from "../../../util/query.util";
import userDelete from "../sql/user-delete";
import userFindAllSql from "../sql/user-find-all.sql";
import userFindByLoginId from "../sql/user-find-by-login-id";
import userFindSql from "../sql/user-find.sql";
import userInsertDetail from "../sql/user-insert-detail";
import userInsertInfoSql from "../sql/user-insert-info.sql";
import userUpdateNicknameSql from "../sql/user-update-nickname.sql";

export class UserService {

    public static async Find(userIdx: number) {
        return await QueryUtil.Select(userFindSql, { userIdx });
    }

    public static async FindByLoginId(loginId: string) {
        return await QueryUtil.Select(userFindByLoginId, { loginId });
    }

    public static async FindAll() {
        return await QueryUtil.Query(userFindAllSql);
    }

    public static async Insert(
        data: {
            loginId: string,
            nickname: string,
            pwd: string
        }
    ) {
        await QueryUtil.Insert(userInsertInfoSql, data);
        const user = await this. FindByLoginId(data.loginId);
        const userIdx = user[0].userIdx;
        return await QueryUtil.Insert(userInsertDetail, { 
            userIdx,
            userLoginType: "asdasd"
         });
    }

    public static async UpdateNickname(data: {
        userIdx: number,
        nickname: string
    }) {
        return await QueryUtil.Update(
            userUpdateNicknameSql, data, "DUPLICATE_USER_NICKNAME"
        );
    }

    public static async Delete(userIdx: number) {
        return await QueryUtil.Delete(
            userDelete, { userIdx }
        );
    }
}