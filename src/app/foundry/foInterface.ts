//https://www.typescriptlang.org/docs/handbook/decorators.html

export interface iObject {
    myType: string;
    myName: string;
    myParent: iObject;
    asReference(): string;
    getChildAt(i: number): iObject;
}

export interface ifoNode {
    override(properties?: any);
    addSubcomponent(obj: ifoNode);
    removeSubcomponent(obj: ifoNode);
}