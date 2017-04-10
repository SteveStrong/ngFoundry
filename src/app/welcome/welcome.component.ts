import { Component, OnInit } from '@angular/core';

import { foNode } from "../foundry/foNode.model";
import { foConcept } from "../foundry/foConcept.model";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  model = [];
  def: foConcept = new foConcept();

  constructor() { }

  ngOnInit(): void {

    let props = {
      first: 'steve',
      last: 'strong',
      full: function () {
        return `hello all ${this.first} - ${this.last}`
      },

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
      new foNode(props),
      new foNode(props),
      new foNode(props)];
  }

}
