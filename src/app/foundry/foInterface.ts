//https://www.typescriptlang.org/docs/handbook/decorators.html

export interface Action<T>
{
    (item: T): void;
}

export interface ModelRef<T>
{
    (): T;
}

export interface Func<T,TResult>
{
    (item: T): TResult;
}

export interface iObject {
    myName: string;
    myParent: ModelRef<iObject>;
    asReference(): string;
    getChildAt(i: number): iObject;
    override(properties?: any);
 }

export interface iNode {
    addSubcomponent(obj: iNode);
    removeSubcomponent(obj: iNode);
}

export interface iKnowledge extends iObject {
}