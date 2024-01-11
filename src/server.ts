import dotenv from "dotenv";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import helmet from "koa-helmet";
import cors from "@koa/cors";
import winston from "winston";
import "reflect-metadata";

import { logger } from "./config/logger";
import { config } from "./config/config";
import { ServerRouter } from "./internal/server-router";
import { pgConn } from "./internal/pg-connection";
import { connectPg, connectPgWithSshTunnel } from "./internal/pg-connection-impl";
import { Color } from "./util/color.util";

async function runApp() {

    const app = new Koa();

    // // Provides important security headers to make your app more secure
    // app.use(helmet.contentSecurityPolicy({
    //     directives:{
    //       defaultSrc:["'self'"],
    //       scriptSrc:["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
    //       styleSrc:["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "fonts.googleapis.com"],
    //       fontSrc:["'self'","fonts.gstatic.com"],
    //       imgSrc:["'self'", "data:", "online.swagger.io", "validator.swagger.io"]
    //     }
    // }));

    app.use(cors());
    app.use(logger(winston));
    app.use(bodyParser());

    ServerRouter.Init(app, config, __dirname);

    // await pgConn.connect();
    if(process.env.PG_USE_SSH_TUNNEL?.toLowerCase() === "true") {
        connectPgWithSshTunnel(pgConn);
    } else {
        connectPg(pgConn);
    }

    app.listen(config.port, () => {
        const profile = process.env.PROFILE;
        console.log(`Server running on port ${config.port} (http://localhost:${config.port}/swagger) [Profile: ${Color.Blue(profile)}]`);
    });
}

runApp();
