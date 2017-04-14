

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';


import { ToastModule } from 'ng2-toastr/ng2-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TreeviewComponent } from './treeview/treeview.component';
import { ListviewComponent } from './listview/listview.component';
import { NetworkviewComponent } from './networkview/networkview.component';
import { TreeitemComponent } from './treeview/treeitem.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { WebglviewComponent } from './webglview/webglview.component';
import { Test1Component } from './webglview/test1.component';

@NgModule({
  declarations: [
    AppComponent,
    TreeviewComponent,
    ListviewComponent,
    NetworkviewComponent,
    TreeitemComponent,
    WelcomeComponent,
    WebglviewComponent,
    Test1Component
  ],
  imports: [
    BrowserAnimationsModule,
    ToastModule.forRoot(),

    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
