import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'fo-card-c',
  templateUrl: './card-c.component.html',
  styleUrls: ['./card-c.component.css']
})
export class CardCComponent implements OnInit {

  @Input('context')
  context:any;

  constructor() { }

  ngOnInit() {
  }

}
