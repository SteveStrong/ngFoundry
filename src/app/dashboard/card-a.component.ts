import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'fo-card-a',
  templateUrl: './card-a.component.html',
  styleUrls: ['./card-a.component.css']
})
export class CardAComponent implements OnInit {

  @Input('context')
  context:any;

  constructor() { }

  ngOnInit() {
  }

}
