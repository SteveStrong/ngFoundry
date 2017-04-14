
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { EmitterService } from './common/emitter.service';
//https://www.npmjs.com/package/ng2-toastr
import { ToastsManager, ToastOptions, Toast } from 'ng2-toastr/ng2-toastr';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ngFoundry';

  constructor(private toastrService: ToastsManager, private options: ToastOptions, vcr: ViewContainerRef) {

    this.toastrService.setRootViewContainerRef(vcr);

    this.options.showCloseButton = true;
    this.options.newestOnTop = true;
    this.options.positionClass = "toast-top-right"; //"toast-bottom-left"  toast-top-full-width


  }

  // if (!environment.production) {
  //   this._url.setBaseUrl('http://localhost:13114');
  //   //this._url.useLocalCashe();
  // }

  openToast(type, title, message) {
    this.toastrService[type](title, message, this.options);
  }

  clearToasts() {
    this.toastrService.clearAllToasts();
  }

  showCustom() {
    this.toastrService.custom('<span style="color: red">Message in red.</span>', null, { enableHTML: true });
  }

  ngOnInit(): void {

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
