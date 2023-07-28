import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  // pass your notification data, type to this component, and it will show them with the icon, color provided in type.
  // pass action item as confirm to show ok and cancel box

  notificaitonData: string;
  notificaitonTypeReceived: string;
  notificaitonTypeColor: string;
  notificaitonActionReceived: string;

  closeAction = false;

  constructor(
    public dialogRef: MatDialogRef<NotificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.notificaitonData = data.notificaitonDataReceived;
    this.notificaitonTypeReceived = data.notificaitonTypeReceived;
    this.notificaitonActionReceived = data.notificaitonActionReceived;

    if (this.notificaitonTypeReceived === 'notification_important') {
      this.notificaitonTypeColor = '#339900';
    } else if (this.notificaitonTypeReceived === 'error') {
      this.notificaitonTypeColor = '#cc3300';
    } else if (this.notificaitonTypeReceived === 'warning') {
      this.notificaitonTypeColor = '#ffcc00';
    } else {
      this.notificaitonTypeColor = '#ffcc00';
    }

    if (this.notificaitonActionReceived === 'logout') {
      this.closeAction = true;
    }

  }

  ngOnInit() {
    let timeToClose = this.notificaitonData.length / 12;
    if (timeToClose < 3) {
      timeToClose = 3.5;
    }
    const currentDialog = this.dialogRef;
    if (this.notificaitonActionReceived !== 'logout') {
      setTimeout(function () {
        currentDialog.close();
      }, (timeToClose * 1000));
    }
  }

  notificationDialogClosed(status: string) {
    this.dialogRef.close(status);
  }

}
