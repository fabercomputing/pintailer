import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { LoginService } from '../internalApp/login.service';
import { NotificationComponent } from '../notification/notification.component';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  // private notify = new Subject<any>();
  /**
   * Observable string streams
   */
  // notifyObservable$ = this.notify.asObservable();

  constructor(public dialog: MatDialog, private loginService: LoginService, private router: Router) { }

  openNotificationBar(message: string, type: string, action: string) {

    const dialogRef = this.dialog.open(NotificationComponent, {
      data: {
        notificaitonDataReceived: message,
        notificaitonTypeReceived: type,
        notificaitonActionReceived: action,
      },
      panelClass: 'notificaiton-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'ok') {
        if (action === 'logout') {
          this.loginService.logout();
          this.router.navigate(['/login']);
        }
      }
    });

  }

}
