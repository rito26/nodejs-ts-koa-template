import { body, desc, description, path, query, request, responses, summary } from "koa-swagger-decorator";
import { HttpMethod, HttpParams, HttpQuery, ParamType } from "../type/http.type";
import { DecoratorReturn } from "../type/decorator.type";
import { GlobalStateKey, controllerState } from "../internal/global-state";

/**
 * required 프로퍼티 기본 값을 true로 설정(기존: false)
 */
function _injectRequiredProp(obj: any) {
    const keys = Object.keys(obj);
    if(keys.length === 0) return;

    for(const key of keys) {
        if(obj[key]["required"] === undefined) {
            obj[key]["required"] = true;
        }
    }
    return obj;
}

/**
 * Global State: Controller State 오브젝트에 데이터 인젝션
 */
function _injectGlobalState(target: any, name: string, obj: Partial<Record<GlobalStateKey, any>>) {
    const csKey = `${target.name}+${name}`;
    controllerState[csKey] = { 
        ...controllerState[csKey], 
        ...obj
    };
}

// ======================================================================================================

/**
 * JWT 토큰 필수 사용
 */
export function Auth(target: any, name: string, descriptor: PropertyDescriptor) {
    descriptor.value.auth = true;
    _injectGlobalState(target, name, { Auth: true });
}

/**
 * RestAPI Method, URL 정의 
 */
export function Api(method: HttpMethod, path: string) {
    return request(method, path);
    // return function(target: any, name: string, descriptor: PropertyDescriptor) {
    //     OverrideCtx(target, name, descriptor); // 
    //     request(method, path)(target, name, descriptor);
    // }
}

/**
 * 제목, 설명
 */
export function Desc(title: string) : DecoratorReturn;
export function Desc(title: string, detail: string) : DecoratorReturn;
export function Desc(title: string, detail?: string) {
    return function (target: any, name: string, descriptor: PropertyDescriptor) {
        if(detail !== undefined) {
            description(detail)(target, name, descriptor);
        }
        return summary(title)(target, name, descriptor);
    };
}

// TODO: 응답 DTO 예시 표시
/**
 * 응답 코드에 따른 설명
 */
export function Responses(responseObj: Record<number, Record<any, any>>): DecoratorReturn;
export function Responses(responseObj: Record<number, string>): DecoratorReturn;
export function Responses(responseObj: Record<number, any>) {
    const ret = {} as any;

    // 1. number - any : 기본 response
    if(Object.keys(responseObj).length === 0) return responses(ret);
    if(typeof Object.keys(responseObj)[0] !== "string") return responses(ret);

    // 2. number - string : <코드, 설명> 꼴
    for(const prop in responseObj) {
        ret[prop] = { description: responseObj[prop] };
    }
    return responses(ret);
}

/**
 * 컨트롤러 요청 내의 모든 쿼리를 아토믹 트랜잭션으로 실행
 */
export function Atomic(target: any, name: string, descriptor: PropertyDescriptor): void {
    const csKey = `${target.name}+${name}`;
    controllerState[csKey] = { 
        ...controllerState[csKey], 
        Atomic: true,
    };
}

/**
 * HTTP 요청 파라미터 목록 정의
 */
export function Params<T extends ParamType>(obj: HttpParams<T>): DecoratorReturn {
    return function (target: any, name: string, descriptor: PropertyDescriptor) {
        _injectGlobalState(target, name, { Params: obj });
        return path(_injectRequiredProp(obj))(target, name, descriptor);
    };
}

/**
 * HTTP 요청 쿼리 목록 정의
 */
export function Query<T extends ParamType>(obj: HttpQuery<T>): DecoratorReturn {
    return function (target: any, name: string, descriptor: PropertyDescriptor) {
        _injectGlobalState(target, name, { Query: obj });
        return query(_injectRequiredProp(obj))(target, name, descriptor);
    };
}

/**
 * HTTP 요청 바디 목록 정의
 */
export function Body<T extends ParamType>(obj: HttpQuery<T>): DecoratorReturn {
    return function (target: any, name: string, descriptor: PropertyDescriptor) {
        _injectGlobalState(target, name, { Body: obj });
        return body(_injectRequiredProp(obj))(target, name, descriptor);
    };
}
