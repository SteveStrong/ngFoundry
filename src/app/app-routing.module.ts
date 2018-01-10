import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StageComponent } from './canvas/stage.component';
import { DrawingComponent } from './canvas/drawing.component';
import { CanvasTestComponent } from './canvas/canvastest.component';
import { NetworkviewComponent } from './networkview/networkview.component';
import { ListviewComponent } from './listview/listview.component';
import { TreeviewComponent } from './treeview/treeview.component';
import { WelcomeComponent } from "./welcome/welcome.component";
import { WebglviewComponent } from './webglview/webglview.component';
import { SwimlaneviewComponent } from './swimlaneview/swimlaneview.component';
import { TestSvgComponent } from './networkview/test-svg.component';
import { TestSvgCircleComponent } from './networkview/test-svg-circle.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'welcome' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'webgl', component: WebglviewComponent },
  { path: 'canvas', component: StageComponent },
  { path: 'drawing', component: DrawingComponent },
  { path: 'test', component: CanvasTestComponent },
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
