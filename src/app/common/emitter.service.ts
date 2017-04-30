
// Credit to https://gist.github.com/sasxa
// Imports
import { Injectable, EventEmitter } from '@angular/core';

//https://scotch.io/tutorials/angular-2-http-requests-with-observables

@Injectable()
export class EmitterService {
    // Event store
    private static _emitters: { [ID: string]: EventEmitter<any> } = {};
    // Set a new event in the store with a given ID
    // as key
    static get(ID: string): EventEmitter<any> {
        if (!this._emitters[ID])
            this._emitters[ID] = new EventEmitter();
        return this._emitters[ID];
    }

    static toast(channel, message, title?) {
        let toast = {
            title: title || '',
            message: message
        }
        this.get(channel).emit(toast);
    }

    static info(message, title?) {
        this.toast("SHOWINFO", message, title);
    }
    static success(message, title?) {
        this.toast("SHOWSUCCESS", message, title);
    }
    static warning(message, title?) {
        this.toast("SHOWWARNING", message, title);
    }

    static error(message, title?) {
        this.toast("SHOWERROR", message, title);
    }
}