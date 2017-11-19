//https://www.typescriptlang.org/docs/handbook/decorators.html

export interface Action<T>
{
    (item: T): void;
}

export interface Func<T,TResult>
{
    (item: T): TResult;
}

export interface iObject {
    myType: string;
    myName: string;
    myParent: iObject;
    asReference(): string;
    getChildAt(i: number): iObject;
    applyToSubComponents<C>(func: Action<C>, deep: boolean);
}

export interface iNode {
    override(properties?: any);
    addSubcomponent(obj: iNode);
    removeSubcomponent(obj: iNode);
}

export interface iKnowledge extends iObject {
}