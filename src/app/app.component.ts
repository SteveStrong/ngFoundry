
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';

import { EmitterService } from './common/emitter.service';
//https://www.npmjs.com/package/ng2-toastr
import { ToastsManager, ToastOptions, Toast } from 'ng2-toastr/ng2-toastr';
import { environment } from '../environments/environment';

//import { Point } from "./foundry/foDecorators";

@Component({
  selector: 'foundry-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title: string = 'ngFoundry';
  href: string;

  constructor(
    private toastrService: ToastsManager,
    private router: Router,
    private options: ToastOptions,
    private vcr: ViewContainerRef) {



    this.toastrService.setRootViewContainerRef(this.vcr);

    this.options.showCloseButton = true;
    this.options.newestOnTop = true;
    this.options.positionClass = "toast-bottom-left"; //"toast-bottom-left" toast-top-right toast-top-full-width
  }

  public get IsProduction() {
    return environment.production;
  }


  openToast(type, title, message) {
    //refresh based on opening toast
    this.href = this.router.url; 
    this.toastrService[type](title, message, this.options);
  }

  clearToasts() {
    this.toastrService.clearAllToasts();
  }

  showCustom() {
    this.toastrService.custom('<span style="color: red">Message in red.</span>', null, { enableHTML: true });
  }

  ngOnInit(): void {

    this.href = this.router.url;

    EmitterService.get("SHOWERROR").subscribe((item) => {
      //console.log('SHOWERROR ' + JSON.stringify(item, undefined, 3));
      this.openToast('error', item.title, item.message);
    });

    EmitterService.get("SHOWWARNING").subscribe((item) => {
      //console.log('SHOWWARNING ' + JSON.stringify(item, undefined, 3));
      this.openToast('warning', item.title, item.message);
    });

    EmitterService.get("SHOWINFO").subscribe((item) => {
      //console.log('SHOWINFO ' + JSON.stringify(item, undefined, 3));
      this.openToast('info', item.title, item.message);
    });

    EmitterService.get("SHOWSUCCESS").subscribe((item) => {
      //console.log('SHOWSUCCESS ' + JSON.stringify(item, undefined, 3));
      this.openToast('success', item.title, item.message);
    });


  }


}
