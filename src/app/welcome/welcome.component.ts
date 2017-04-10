import { Component, OnInit } from '@angular/core';

import { foNode } from "../foundry/foNode.model";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  model: any = {}

  constructor() { }

  ngOnInit():void {

    let props = {
      first: 'steve',
      last: 'strong',
      full: function() {
        return `hello all ${this.first} - ${this.last}`
      },

      morestuff: function(x) {
        return `${this.first} - ${this.last}`
      }
    }

    
    let result = new foNode(props);
    this.model = result;
  }

}
