

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';


import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { MaptoKeysPipe, ModelJsonPipe } from './common/maptokeys.pipe';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TreeviewComponent } from './treeview/treeview.component';
import { ListviewComponent } from './listview/listview.component';
import { NetworkviewComponent } from './networkview/networkview.component';
import { TreeitemComponent } from './treeview/treeitem.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { WebglviewComponent } from './webglview/webglview.component';
import { TestForcediagramComponent } from './networkview/test-forcediagram.component';
import { TestSceen1Component } from './webglview/test-sceen1.component';

import { DockerecosystemComponent } from './networkview/dockerecosystem.component';
import { DockerecosystemService } from "./networkview/dockerecosystem.service";
import { SwimlaneviewComponent } from './swimlaneview/swimlaneview.component';
import { SwimlaneComponent } from './swimlaneview/swimlane.component';
import { SwimelementComponent } from './swimlaneview/swimelement.component';
import { SwimService } from "./swimlaneview/swim.service";
import { TestSvgComponent } from './networkview/test-svg.component';
import { TestSvgCircleComponent } from './networkview/test-svg-circle.component';

import { SignalRService } from "./common/signalr.service";
import { SharingService } from "./common/sharing.service";
import { StageComponent } from './canvas/stage.component';
import { CanvasTestComponent } from './canvas/canvastest.component';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { foInspectorComponent } from './canvas/fo-inspector/fo-inspector.component';
import { foStencilComponent } from './canvas/fo-inspector/fo-stencil.component';
import { foModelComponent } from './canvas/fo-inspector/fo-model.component';
import { foDrawingComponent } from './canvas/fo-inspector/fo-drawing.component';
import { foRuntimeComponent } from './canvas/fo-inspector/fo-runtime.component';
import { foCommandComponent } from './canvas/fo-inspector/fo-command.component';
import { foConceptComponent } from './canvas/fo-inspector/fo-concept.component';
import { foStencilPanelComponent } from './canvas/fo-inspector/fo-stencil-panel.component';
import { foPagePanelComponent } from './canvas/fo-inspector/fo-page-panel.component';
import { foModelPanelComponent } from './canvas/fo-inspector/fo-model-panel.component';
import { foConceptPanelComponent } from './canvas/fo-inspector/fo-concept-panel.component';
import { DrawingComponent } from './canvas/drawing.component';
import { foPageComponent } from './canvas/fo-inspector/fo-page.component';
import { foStencilCardComponent } from './canvas/fo-inspector/fo-stencil-card.component';
import { foConceptCardComponent } from './canvas/fo-inspector/fo-concept-card.component';
import { WorldComponent } from './canvas/world.component';
import { foEventsComponent } from './canvas/fo-inspector/fo-events.component';

@NgModule({
  declarations: [
    AppComponent,
    MaptoKeysPipe,
    ModelJsonPipe,
    TreeviewComponent,
    ListviewComponent,
    NetworkviewComponent,
    TreeitemComponent,
    WelcomeComponent,
    WebglviewComponent,
    TestForcediagramComponent,
    TestSceen1Component,
    DockerecosystemComponent,
    SwimlaneviewComponent,
    SwimlaneComponent,
    SwimelementComponent,
    TestSvgComponent,
    TestSvgCircleComponent,

    StageComponent,

    CanvasTestComponent,

    foInspectorComponent,
    foStencilComponent,
    foModelComponent,
    foDrawingComponent,
    foRuntimeComponent,
    foCommandComponent,
    foConceptComponent,
    foStencilPanelComponent,
    foPagePanelComponent,
    foModelPanelComponent,
    foConceptPanelComponent,
    DrawingComponent,
    foPageComponent,
    foStencilCardComponent,
    foConceptCardComponent,
    WorldComponent,
    foEventsComponent
  ],
  imports: [
    BrowserAnimationsModule,
    AccordionModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    ToastModule.forRoot(),

    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
    DockerecosystemService, 
    SwimService, 
    SignalRService,
    SharingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
