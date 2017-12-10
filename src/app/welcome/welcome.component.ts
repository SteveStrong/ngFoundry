///import { parse } from 'querystring';
import { Component, OnInit, ViewChild } from '@angular/core';

import { foNode } from "../foundry/foNode.model";
import { foConcept } from "../foundry/foConcept.model";

import { Toast } from '../common/emitter.service';
import { SignalRService } from "../common/signalr.service";

//https://www.npmjs.com/package/ng2-tag-input

@Component({
  selector: 'foundry-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  @ViewChild('chat')  public inputRef: HTMLInputElement;
  typeinText: string = '';
  postList: Array<any> = [];
  model = [];
  def: foConcept = new foConcept();

  constructor(private signalR: SignalRService) {

  }

  doToast(): void {
    Toast.info("info message", "my title")
  }

  doVersion(): void {
    this.signalR.askforVersion();
  }

  doPost() {
    let text = this.inputRef.innerText || this.typeinText;
    this.signalR.send(text);
    this.typeinText = '';
  }

  onKeyUp(value: string) {
    this.typeinText = value;
  }

  onInput(value: string) {
    this.typeinText = value;
    this.doPost();
  }

  ngOnInit(): void {

    this.signalR.start().then( () => {
      this.signalR.receive(data => {
        Toast.info(JSON.stringify(data), "receive");
        this.postList.push(data);
      });
    });


    let xxx = function () { return "hello" }
    let yyy = xxx.toString();
    let zzz = '{ return "hello" }';

    function evil(fn) {
      return new Function(fn)();
    }

    let props = {
      first: 'steve',
      last: 'strong',
      full: function () {
        return `hello all ${this.first} - ${this.last}`
      },
      xxx: xxx,
      yyy: yyy,
      zzz: evil(zzz),
      morestuff: function (x) {
        return `${this.first} - ${this.last}`
      }
    }

    this.def = new foConcept({
      first: 'mile',
      last: 'davis',
    });


    this.model = [
      this.def,
      this.def.newInstance(),
      // new foNode(props),
      // new foNode(props),
      new foNode(props)];
  }

}
