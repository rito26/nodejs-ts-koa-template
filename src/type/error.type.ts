import { HttpStatus } from "./http.type";
import { errorList } from "../common/error-list";

export type ErrorDefinition = Record<string, {
    code: string;
    msg: string;
}>
export type ErrorCase = keyof typeof errorList;

export class ErrorWithCase extends Error {
    constructor(public errorCase: ErrorCase) {
        super(errorList[errorCase].msg);
        Object.setPrototypeOf(this, ErrorWithCase.prototype);
    }
} 

export class QueryFailError extends Error {
    constructor(public detail: string) {
        super("Query Failed");
        Object.setPrototypeOf(this, QueryFailError.prototype);
    }
} 
