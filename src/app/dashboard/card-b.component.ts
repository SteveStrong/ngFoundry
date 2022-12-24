import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'fo-card-b',
  templateUrl: './card-b.component.html',
  styleUrls: ['./card-b.component.css']
})
export class CardBComponent implements OnInit {

  @Input('context')
  context:any;

  constructor() { }

  ngOnInit() {
  }

}
