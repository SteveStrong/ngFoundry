import { Injectable, OnInit } from '@angular/core';
import { HubConnection } from '@aspnet/signalr-client';

//https://blogs.msdn.microsoft.com/webdev/2017/09/14/announcing-signalr-for-asp-net-core-2-0/

@Injectable()
export class SignalRService  implements OnInit {

  constructor() { }
  ngOnInit(): void {
    console.log ("on init ...");
    let connection = new HubConnection('http://localhost:5001/chathub');

    connection.on('send', data => {
      console.log(data);
    });

    console.log ("starting ...");
    connection.start()
      .then(() => console.log("connected"));
    //.then(() => connection.invoke('send', 'Hello'));
  }
}
