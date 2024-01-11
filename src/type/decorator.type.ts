
export type DecoratorReturn = 
    (target: any, name: string, descriptor: PropertyDescriptor) => PropertyDescriptor;