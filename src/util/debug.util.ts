import * as Util from "util";
import { Color, EColor } from "./color.util";
import { config } from "../config/config";
import { isDevOnly } from "../internal/internal-utils";

export class Debug {

    private static _PrintLineCyan(len: number = 25) {
        console.log(Color.Colorize("─────".repeat(len), EColor.Cyan));
    }
    private static _PrintLineYellow(len: number = 25) {
        console.log(Color.Colorize("─────".repeat(len), EColor.Yellow));
    }
    private static _PrintLineRed(len: number = 25) {
        console.log(Color.Colorize("─────".repeat(len), EColor.Red));
    }

    private static _getCallerPath() {

        const getStackTrace = function() {
            const obj = {} as any;
            Error.captureStackTrace(obj, getStackTrace);
            return obj.stack;
        };

        const stackTrace: string = getStackTrace();
        const stackLines = stackTrace.split("\n    at ");
        const targetStack = stackLines[3].match(/\(.+\)/);
        return targetStack;
    }

    public static Log(...args: any) {

        this._PrintLineCyan();

        if(isDevOnly() && config.showCommonLogCallerPath) {
            const caller = this._getCallerPath();
            if(caller != null) {
                console.log(`${Color.Yellow("Caller: ")}${caller}`);
                this._PrintLineYellow(23);
            }
        }
        
        console.log(...args);
        console.log();
    }

    public static DeepLog(obj: any) {
        this._PrintLineCyan();
        console.log(Util.inspect(obj, true, null, true));
    }

    public static LogError(msg: string, showCallerPath: boolean = true) {

        this._PrintLineCyan();

        if(isDevOnly() && config.showErrorLogCallerPath && showCallerPath) {
            const caller = this._getCallerPath();
            if(caller != null) {
                console.log(`${Color.Yellow("Caller: ")}${caller}`);
                this._PrintLineRed(23);
            }
        }

        console.log(`${Color.Red("[ERROR]")} ${Color.Yellow(msg)}` );
        console.log();
    }
}