import dotenv from "dotenv";

dotenv.config({ path: ".env" });

export interface Config {
    port: number;
    debugLogging: boolean;
    jwtSecret: string;
    // dbsslconn: boolean;
    // dbEntitiesPath: string[];
    // cronJobExpression: string;

    /** 실행되는 모든 쿼리 자동 출력 */
    autoPrintQuery: boolean;

    /** 모든 SELECT 쿼리의 컬럼명을 snake_case에서 camelCase로 자동 변환  */
    autoSelectCaseTransform: boolean;

    /** Debug.Log() 호출할 때마다 호출 스택 전체 출력 */
    showCommonLogCallerPath: boolean;

    /** Debug.LogError() 호출할 때마다 호출 스택 전체 출력 */
    showErrorLogCallerPath: boolean;
}

const isDevMode = process.env.NODE_ENV == "development";

/** SERVER GLOBAL CONFIG */
const config: Config = {
    port: +(process.env.PORT || 4000),
    debugLogging: isDevMode,
    jwtSecret: process.env.JWT_SECRET || "your-secret-whatever",
    
    autoPrintQuery: false,
    autoSelectCaseTransform: true,

    showCommonLogCallerPath: true,
    showErrorLogCallerPath: true,
};

export { config };