import dotenv from "dotenv";
import { Pool } from "pg";
import * as net from "net";
import * as fs from "fs";
import * as ssh from "ssh2";
import { config } from "../config/config";
import { handlePgSnakeFieldsToCamel } from "./pg-camel-case";
import { SharedPgConnection } from "./pg-connection";
import { Color } from "../util/color.util";

async function checkConnection(pool: Pool, info: string) {

    try {
        const res = await pool.query("SELECT 1 AS _");
        if(res.rowCount > 0) {
            console.log(Color.Green("PG Connected Successfully") + ` - [${info}]`);
        }
        else throw Error();
    } catch {
        console.log(Color.Red("PG Connection Failed") + ` - [${info}]`);
    }
}

export async function connectPg(con: SharedPgConnection) {
    const conf = {
        host: process.env.PG_HOST,
        port: Number(process.env.PG_PORT),
        user: process.env.PG_USER,
        password: process.env.PG_PASS,
        database: process.env.PG_DB,
        query_timeout: 4000,
        connectionTimeoutMillis: 3000,
    };
    const pool = new Pool(conf);  

    if(config.autoSelectCaseTransform) {
      handlePgSnakeFieldsToCamel(pool);
    }

    con.pool = pool;

    await checkConnection(pool, `${conf.host}:${conf.port}/db=${conf.database}&user=${conf.user}`);
}

export function connectPgWithSshTunnel(con: SharedPgConnection) {

    const pgConfig = {
        host: process.env.PG_HOST,
        port: Number(process.env.PG_PORT),
        user: process.env.PG_USER,
        password: process.env.PG_PASS,
        database: process.env.PG_DB,
    };
    const bastionConfig = {
        host: process.env.PG_BASTION_HOST,
        user: process.env.PG_BASTION_USER,
        keyPath: process.env.PG_BASTION_KEY_PATH,
        localForwardPort: Number(process.env.PG_LOCAL_FORWARD_PORT),
    };
    const localhost = "127.0.0.1";
    
    let ready = false;
    const sshc = new ssh.Client();
    const proxy = net.createServer((sock) => {
    
        if(!ready) {
            return sock.destroy();
        }
        sshc.forwardOut(sock.remoteAddress, sock.remotePort, pgConfig.host, pgConfig.port, 
            (err, stream) => {
                if (err) {
                    return sock.destroy();
                }
                sock.pipe(stream);
                stream.pipe(sock);
            }
        );
    });
    proxy.listen(bastionConfig.localForwardPort, localhost);
    
    const sshConfig = {
        host: bastionConfig.host,
        port: 22,
        username: bastionConfig.user,
        privateKey : fs.readFileSync(bastionConfig.keyPath),
    };
    sshc.connect(sshConfig);

    sshc
    .on("connect", function() {
        // console.log('PG Tunnel Connection :: connect');
    })
    .on("ready", async function() {
        // console.log('PG Tunnel Ready');
        ready = true;

        const pool = new Pool({
            host: localhost,
            port: bastionConfig.localForwardPort,
            user: process.env.PG_USER,
            password: process.env.PG_PASS,
            database: process.env.PG_DB,
            query_timeout: 4000,
            connectionTimeoutMillis: 3000,
        });

        con.pool = pool;
        checkConnection(pool, 
            `${pgConfig.host}:${pgConfig.port}/db=${pgConfig.database}&user=${pgConfig.user} ` +
            `(Bastion: ${bastionConfig.host}, Local Forward: ${localhost}:${bastionConfig.localForwardPort})`
        );
    });
}