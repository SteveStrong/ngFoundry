import { Tools, foNames } from './foTools'
import { iObject, iNode, Action } from './foInterface'

import { foObject } from './foObject.model'
import { foInstance } from './foInstance.model'
import { foConcept } from './foConcept.model';
import { foCollection } from './foCollection.model'

import { RuntimeType } from './foRuntimeType';
import { foPage } from './shapes/foPage.model';
import { foWorkspace } from './foWorkspace.model'

export class foHydrationManager {
    workspace: foWorkspace;
    isTesting: boolean = false;
    files: any = {}

    constructor(context: foWorkspace, test: boolean = false) {
        this.workspace = context;
        this.isTesting = test;
    }

    public reHydrateJson(json) {

        let { myClass, myName, myType, myGuid } = json;

        let type = RuntimeType.find(myType);
        if (type == foPage) {
            let page = this.workspace.document.findPage(myName);
            page && this.hydrateInstance(page, json);
            this.reHydrate(page, json.subcomponents);
        }

        delete this.workspace;
        return true;
    }

    private extractSpec(json:any){
        let spec = {}
        Tools.forEachKeyValue(json, (key, value)=>{
            if ( !Tools.matches(key,'subcomponents')) {
                spec[key] = value;
            }
        })
        return spec;
    }

    private reHydrate(parent:foInstance, json:any){
        json.forEach(spec => {
            let { subcomponents } = spec;
            let item = this.establishInstance(spec);
            item.addAsSubcomponent(parent);
            subcomponents && this.reHydrate(item, subcomponents);
        });
    }


    private establishInstance(json: any):foInstance {

        let { myClass, myType, myGuid } = json;
        let spec = this.extractSpec(json);
        let concept = this.workspace.select(item => Tools.matches(item.myName, myClass)).first();
        let type = RuntimeType.find(myType);

        let obj = concept && concept.newInstance(spec);
        obj = obj ? obj : RuntimeType.create(type, spec);

        //this is duplicate work, no reason to do this
        obj.reHydrate(spec);
        return obj;
    }

    private hydrateInstance(obj: foInstance, json: any) {
        if (!obj) return false;

        let { myClass, myName, myType, myGuid } = json;

        if (obj.myClass != myClass) return false;
        if (obj.myName != myName) return false;
        if (obj.myType != myType) return false;

        let data = this.extractSpec(json);
        obj.reHydrate(data);

    }
}