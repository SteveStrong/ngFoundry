
import { foObject } from './foObject.model'

export class foCommand extends foObject{
    command:string;
    doAction: () => void;
    getLabel: () => string;

    constructor(command:string, doAction:()=>void, getLabel?: () => string) {
        super();
        this.command = command;
        this.doAction = doAction;
        this.getLabel = getLabel ? getLabel : () => { return this.command; }
    }
}

export class foToggle extends foObject{
    command:string;
    doToggle: () => void;
    getState: () => any;
    getLabel: () => string;

    constructor(command:string, doToggle:()=>void, getState: () => any, getLabel?: () => string) {
        super();
        this.command = command;
        this.doToggle = doToggle;
        this.getState = getState;
        this.getLabel = getLabel ? getLabel : () => { return this.command; }
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

