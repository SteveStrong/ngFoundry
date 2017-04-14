import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { NetworkviewComponent } from './networkview/networkview.component';
import { ListviewComponent } from './listview/listview.component';
import { TreeviewComponent } from './treeview/treeview.component';
import { WelcomeComponent } from "../app/welcome/welcome.component";
import { WebglviewComponent } from './webglview/webglview.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'welcome' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'webgl', component: WebglviewComponent },
  { path: 'tree', component: TreeviewComponent },
  { path: 'list', component: ListviewComponent },
  { path: 'network', component: NetworkviewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
