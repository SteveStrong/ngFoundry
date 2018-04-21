
import { foObject } from './foObject.model'

//SRS integrate mYName , DisplayName and isVisible  into command rendering

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

    private _commands: Array<foCommand> = new Array<foCommand>();
    addCommands(...cmds: foCommand[]) {
        this._commands.push(...cmds);
        this._toggle.forEach(item => !item.hasParent && item.setParent(this))
        return this;
    }
  
    get commands(): Array<foCommand> {
        return this._commands;
    }

    private _toggle: Array<foToggle> = new Array<foToggle>();
    addToggle(...cmds: foToggle[]) {
        this._toggle.push(...cmds);
        this._toggle.forEach(item => !item.hasParent && item.setParent(this))
        return this;
    }
  
    get toggles(): Array<foToggle> {
        return this._toggle;
    }
 
}

