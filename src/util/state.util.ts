// import { GlobalStateKey, contextState } from "../internal/global-state";
import { MiddleWareContext } from "../type/context.type";

export default class StateUtil {

    // public static GetGlobalKey(ctx: MiddleWareContext) {
        
    // }

    // public static GetState(ctx: MiddleWareContext, key: GlobalStateKey) {

    //     // let xsKey = `${ctx.request.method.toLowerCase()}+${ctx.request.url}`;
    //     let xsKey = `${ctx.request.method.toLowerCase()}+${ctx._matchedRoute}`;
    //     if(xsKey.includes("?")) {
    //         xsKey = xsKey.substring(0, xsKey.indexOf("?"));
    //     }
    //     // const xsKey = `${ctx.request.method.toLowerCase()}+${ctx.routerPath}`;
    //     // console.log(`[[ ${xsKey} ]]`);
    //     const xsVal = contextState[xsKey];

    //     return xsVal != null ? xsVal[key] : undefined;
    // }
}