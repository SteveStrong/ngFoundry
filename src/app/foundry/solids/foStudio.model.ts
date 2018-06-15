
import { Tools } from '../foTools'
import { foObject } from '../foObject.model'
import { foStage } from './foStage.model'
import { foNode } from '../foNode.model'
import { foDictionary } from '../foDictionary.model'

import { BroadcastChange } from '../foChange';

export class foStudio extends foNode {

    stageWidth: number;
    stageHeight: number;
    stageDepth: number;

    private _stages: foDictionary<foStage> = new foDictionary<foStage>({ myName: 'stages' });
    private _stageByGuid = {};

    constructor(properties?: any, subcomponents?: Array<foStage>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    get stages() {
        return this._stages;
    }

    findStage(name: string) {
        return this._stages.find(name);
    }

    findStageByGuid(guid: string) {
        if (!Object.keys(this._stageByGuid).length) {
            this.stages.forEachKeyValue((key, page) => {
                this._stageByGuid[page.myGuid] = page;
            });
        }
        return this._stageByGuid[guid];
    }

    createStage(properties?: any) {
        this._stageByGuid = {};
        let nextStage = `Stage-${this.stages.count + 1}`;
        let spec = Tools.union(properties, {
            myName: nextStage,
            width: this.stageWidth || 1000,
            height: this.stageHeight || 1000,
            depth: this.stageDepth || 1000,
        });
        this.currentStage = new foStage(spec);

        Lifecycle.event('syncPage', this.currentStage);
        return this.currentStage;
    }

    private _currentStage: foStage
    get currentStage() {
        if (this.stages.count == 0 || !this._currentStage) {
            this._currentStage = this.createStage();
        }
        return this._currentStage;
    }
    set currentStage(stage: foStage) {
        if (this._currentStage != stage) {
            this._currentStage = stage;
            this.stages.addItem(stage.myName, stage);
            BroadcastChange.changed('currentStage', this);
        }
    }
}

import { RuntimeType } from '../foRuntimeType';
import { Lifecycle } from '../foLifecycle';
RuntimeType.define(foStudio);