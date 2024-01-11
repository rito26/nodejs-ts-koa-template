import { QueryResult } from "pg";
import { config } from "../config/config";
import { pgConn } from "../internal/pg-connection";
import { DeleteQuery, ExtractInputFromQuery, ExtractOutputFromQuery, InsertQuery, SelectQuery, UpdateQuery } from "../type/sql.type";
import { Debug as Debug } from "./debug.util";
import { ErrorCase, ErrorWithCase, QueryFailError } from "../type/error.type";

export default class QueryUtil {

    private static async _RunQuery<TQuery extends string> (
        queryString: TQuery, 
        input?: ExtractInputFromQuery<TQuery>
    )
    : Promise<QueryResult<any>> 
    {
        const keys = input === undefined ? [] : Object.keys(input);
        const keysBr = keys.map((v) => `{${v}}`);
        const vals = keys.map((v) => (input as any)[v]);
        const dols = keys.map((v, idx) => `$${idx + 1}`);

        let parsedQuery: string = queryString;
        keysBr.forEach((v, idx) => { 
            parsedQuery = parsedQuery.replaceAll(v, `${dols[idx]} /* ${vals[idx]} */ `); 
        });

        // console.log(queryString);
        if(config.autoPrintQuery) {
            Debug.Log(parsedQuery);
        }

        try {
            const res = await pgConn.pool.query(parsedQuery, vals);
            return res;

        } catch (err: any) {
            Debug.LogError(`Query Failed: ${err.message}`);
            console.log(parsedQuery);
            throw new QueryFailError(err.message);
        }
    }

    /**
     * 쿼리 실행 + 에러 발생 시 지정한 에러 케이스로 catch
     */
    private static async _RunQueryWithCaseCatch<TQuery extends string> (
        queryString: TQuery, 
        input: ExtractInputFromQuery<TQuery>, 
        errorCase?: ErrorCase
    )
    : Promise<void>
    {
        if(errorCase === undefined) {
            await this._RunQuery<TQuery>(queryString, input);
        } else {
            try {
                await this._RunQuery<TQuery>(queryString, input);
            } catch {
                throw new ErrorWithCase(errorCase);
            }
        }
    }

    // =====================================================================
    //  Public Query Runners
    // =====================================================================
    public static async Query<TQuery extends string> (
        queryString: TQuery, 
        input?: ExtractInputFromQuery<TQuery>
    )
    : Promise<any[]> 
    {
        return (await this._RunQuery(queryString, input)).rows;
    }

    public static async Select<TQuery extends SelectQuery> (
        queryString: TQuery, 
        input?: ExtractInputFromQuery<TQuery>
    )
    : Promise<ExtractOutputFromQuery<TQuery>[]>
    {
        return await this.Query<TQuery>(queryString, input);
    }

    public static async Insert<TQuery extends InsertQuery> (
        queryString: TQuery, 
        input: ExtractInputFromQuery<TQuery>, 
        errorCase?: ErrorCase
    )
    : Promise<void>
    {
        await this._RunQueryWithCaseCatch<TQuery>(queryString, input, errorCase);
    }

    public static async Update<TQuery extends UpdateQuery> (
        queryString: TQuery,
        input: ExtractInputFromQuery<TQuery>,
        errorCase?: ErrorCase
    )
    : Promise<void>
    {
        await this._RunQueryWithCaseCatch<TQuery>(queryString, input, errorCase);
    }

    public static async Delete<TQuery extends DeleteQuery> (
        queryString: TQuery,
        input: ExtractInputFromQuery<TQuery>,
        errorCase?: ErrorCase
    )
    : Promise<void>
    {
        await this._RunQueryWithCaseCatch<TQuery>(queryString, input, errorCase);
    }

    // =====================================================================
    //  Transactions
    // =====================================================================
    public static async BeginTransaction() : Promise<boolean> {
        try {
            await pgConn.pool.query("BEGIN");
            return true;
        }
        catch {
            return false;
        }
    }
    public static async CommitTransaction() : Promise<boolean> {
        try {
            await pgConn.pool.query("COMMIT");
            return true;
        }
        catch {
            return false;
        }
    }
    public static async RollbackTransaction() : Promise<boolean> {
        try {
            await pgConn.pool.query("ROLLBACK");
            return true;
        }
        catch {
            return false;
        }
    }
}