import { foObject } from './foObject.model';

//SRS integrate mYName , DisplayName and isVisible  into command rendering

export class foCommand extends foObject {
  doAction: () => void;
  getLabel: () => string;

  constructor(myName: string, doAction: () => void, getLabel?: () => string) {
    super();
    this.myName = myName;
    this.doAction = doAction;
    this.getLabel = getLabel ? getLabel : () => { return this.myName; };
  }
}

export class foToggle extends foObject {
  doToggle: () => void;
  getState: () => any;
  getLabel: () => string;

  constructor(
    myName: string,
    doToggle: () => void,
    getState: () => any,
    getLabel?: () => string
  ) {
    super();
    this.myName = myName;
    this.doToggle = doToggle;
    this.getState = getState;
    this.getLabel = getLabel ? getLabel : () => { return this.myName; };
  }
}

export class foController extends foObject {
  constructor() {
    super();
  }

  private _commands: Array<foCommand> = new Array<foCommand>();
  addCommands(...cmds: foCommand[]) {
    this._commands.push(...cmds);
    this._toggle.forEach(item => !item.hasParent && item.setParent(this));
    return this;
  }

  get commands(): Array<foCommand> {
    return this._commands;
  }

  private _toggle: Array<foToggle> = new Array<foToggle>();
  addToggle(...cmds: foToggle[]) {
    this._toggle.push(...cmds);
    this._toggle.forEach(item => !item.hasParent && item.setParent(this));
    return this;
  }

  get toggles(): Array<foToggle> {
    return this._toggle;
  }
}
