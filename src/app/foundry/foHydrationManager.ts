import { Tools } from './foTools'

import { IDisposable } from './foObject.model'
import { foInstance } from './foInstance.model'
import { foKnowledge } from './foKnowledge.model'

import { RuntimeType } from './foRuntimeType';
import { foPage } from './shapes/foPage.model';
import { foModel } from './foModel.model';
import { foWorkspace } from './foWorkspace.model'

export class foHydrationManager implements IDisposable {
    workspace: foWorkspace;
    isTesting: boolean = false;
    files: any = {}

    constructor(context: foWorkspace, test: boolean = false) {
        this.workspace = context;
        this.isTesting = test;
    }

    dispose() {
        delete this.workspace;
    }



    public deHydrate(source: foInstance | foKnowledge): any {
        let result: any = {
            author: '',
            version: 'xxx',
            sessionId: '',
            creationDate: (new Date()).toISOString(),
        }

        let { myType, myGuid, myName } = source;

        result['myGuid'] = myGuid;
        result['myType'] = myType;
        result['myName'] = myName;
        result[myType] = source.deHydrate();
      
        return result;
    }

    public reHydrate(json: any): foInstance {
        let result: foInstance;

        let { myType, myName } = json;

        let type = RuntimeType.find(myType);
        let payload = json[myType];
        let data = this.extractSpec(payload);

        if (type == foPage) {
            let page = this.workspace.document.findPage(myName);
            page && this.hydrateInstance(page, data);
            this.reHydrateModel(page, payload.subcomponents,true);
        }

        if (type == foModel) {
            let model = this.workspace.model.establish(myName);
            model && this.hydrateInstance(model, data);
            this.reHydrateModel(model, payload.subcomponents,true);
        }

        return result;
    }

    private extractSpec(json: any) {
        let spec = {}
        Tools.forEachKeyValue(json, (key, value) => {
            if (!Tools.matches(key, 'subcomponents')) {
                spec[key] = value;
            }
        })
        return spec;
    }

    private reHydrateModel(parent: foInstance, json: any, rename:boolean=false) {

        let list = [];
        json && json.forEach(spec => {
            let data = this.extractSpec(spec);
            let { subcomponents, myName, myGuid } = spec;

            let found = parent.nodes.find(child => child.myName == myName || child.myName == myGuid);
            
            if (found) {
                found.reHydrate(data)
            } else {
                found = this.establishInstance(data)
                list.push(found);
            }
            
            rename && found.generateName();
            subcomponents && this.reHydrateModel(found, subcomponents, false);
        });

        list.forEach( found => {
            found.addAsSubcomponent(parent);
        })
       
    }


    private establishInstance(spec: any): foInstance {

        let { myClass, myType } = spec;

        let concept = this.workspace.select(item => Tools.matches(item.myName, myClass)).first();

        let obj = concept && concept.newInstance(spec);
        if (obj) return obj;

        let type = RuntimeType.find(myType);
        obj = RuntimeType.create(type, spec);

        return obj;
    }

    private hydrateInstance(obj: foInstance, json: any) {
        if (!obj) return false;

        let { myClass, myName, myType } = json;

        if (obj.myClass != myClass) return false;
        if (obj.myName != myName) return false;
        if (obj.myType != myType) return false;

        let data = this.extractSpec(json);
        obj.reHydrate(data);
    }
}