

import { foObject } from './foObject.model'




export class foToggle extends foObject{
    command:string;
    doToggle: () => void;
    getState: () => any;

    constructor(command:string, doToggle:()=>void, getState: () => any) {
        super();
        this.command = command;
        this.doToggle = doToggle;
        this.getState = getState;
    }
}

export class foController extends foObject {

    private _commands: Array<string> = new Array<string>();
    addCommands(...cmds: string[]) {
        this._commands && this._commands.push(...cmds)
        return this;
    }
  
    get commands(): Array<string> {
        return this._commands;
    }

    private _toggle: Array<foToggle> = new Array<foToggle>();
    addToggle(...cmds: foToggle[]) {
        this._toggle && this._toggle.push(...cmds)
        return this;
    }
  
    get toggles(): Array<foToggle> {
        return this._toggle;
    }
 
}

