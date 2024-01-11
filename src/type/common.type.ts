
// export interface ClassTypeGeneric<T> extends Function { new (...args: any[]): T; }
export type ClassType = { new(...args: any[]): any; };