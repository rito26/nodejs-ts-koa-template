import { Pool } from "pg";

export type SharedPgConnection = {
    pool: Pool;
}

export const pgConn: SharedPgConnection = {
    pool: undefined,
};