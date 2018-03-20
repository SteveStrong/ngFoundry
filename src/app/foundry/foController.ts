import { Tools } from './foTools'
import { PubSub } from './foPubSub'

import { foObject } from './foObject.model'



export class foController extends foObject {

    private _commands: Array<string> = new Array<string>();
    addCommands(...cmds: string[]) {
        this._commands && this._commands.push(...cmds)
        return this;
    }
  
    get commands(): Array<string> {
        return this._commands;
    }
 
}

