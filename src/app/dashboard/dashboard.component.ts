import { Component, OnInit, AfterContentInit, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

import { cards, sampleData } from './cardDictionary'

@Component({
  selector: 'fo-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterContentInit {
  @ViewChild('dashboardbody', { read: ViewContainerRef }) dashboardbody;

  dataList = sampleData;

  constructor(private resolver: ComponentFactoryResolver) {
  }

  ngOnInit() {
  }

  ngAfterContentInit() {
    this.dataList.forEach(item => {
      let runtimeType = cards[item.type];
      let type = this.resolver.resolveComponentFactory(runtimeType);
      let ref = this.dashboardbody.createComponent(type);
      ref.instance.context = item;
    });

  }
}
