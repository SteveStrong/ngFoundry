import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { NetworkviewComponent } from './networkview/networkview.component';
import { ListviewComponent } from './listview/listview.component';
import { TreeviewComponent } from './treeview/treeview.component';
import { WelcomeComponent } from "../app/welcome/welcome.component";
import { WebglviewComponent } from './webglview/webglview.component';
import { SwimlaneviewComponent } from 'app/swimlaneview/swimlaneview.component';
import { TestSvgComponent } from './networkview/test-svg.component';
import { TestSvgCircleComponent } from './networkview/test-svg-circle.component';
const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'welcome' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'webgl', component: WebglviewComponent },
  { path: 'svg', component: TestSvgComponent },
  { path: 'circle', component: TestSvgCircleComponent },
  { path: 'tree', component: TreeviewComponent },
  { path: 'list', component: ListviewComponent },
  { path: 'swim', component: SwimlaneviewComponent },
  { path: 'network', component: NetworkviewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
