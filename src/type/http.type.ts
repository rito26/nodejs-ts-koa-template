
export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export type ParamType = "string" | "number" | "array";
export type HttpTransferObject<T extends ParamType = ParamType> = 
    Record<string,
        {
            type: T;
            required?: boolean;
            description?: string;
            default?: T extends "string" ? string : 
                      T extends "number" ? number :
                      T extends "array"  ? any[]  :
                      any;
        }
    >;
export type HttpParams<T extends ParamType = ParamType> = HttpTransferObject<T>;
export type HttpQuery<T extends ParamType = ParamType> = HttpTransferObject<T>;
export type HttpBody<T extends ParamType = ParamType> = HttpTransferObject<T>;

/**
 * https://developer.mozilla.org/ko/docs/Web/HTTP/Status
 */
export enum HttpStatus {
    Ok = 200,
    
    Unauthorized       = 401,
    Forbidden          = 403,
    NotFound           = 404,
    NotAcceptable      = 406,
    RequestTimeout     = 408,
    Conflict           = 409,

    ServerError        = 500,
    ServiceUnavailable = 503,
}