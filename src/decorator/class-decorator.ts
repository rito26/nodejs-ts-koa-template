import { prefix, tagsAll } from "koa-swagger-decorator";
import { DecoratorReturn } from "../type/decorator.type";

export function Category(category: string) {
    return tagsAll(category);
}
export function Prefix(prefixString: string) {
    return function (target: any) {
        target.prefix = prefixString;
        
        return prefix(prefixString)(target);
    };
}