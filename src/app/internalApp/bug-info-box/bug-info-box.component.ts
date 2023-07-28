import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EnterLeave, fadeInOut } from '../animations';
import { ReleaseBug } from '../bug';
import { BugService } from '../bug.service';
import { HelpPopupComponent } from '../help-popup/help-popup.component';

@Component({
  selector: 'app-bug-info-box',
  templateUrl: './bug-info-box.component.html',
  styleUrls: ['./bug-info-box.component.css'],
  animations: [
    fadeInOut, EnterLeave
  ]
})
export class BugInfoBoxComponent implements OnInit {

  description: string;
  previousProject: number;
  organization: string;
  testCaseId: number;
  releaseProdBugs: ReleaseBug[] = [];
  releaseNormalBugs: ReleaseBug[] = [];
  displayedColumns: string[] = ['ticketId', 'remarks', 'applicable', 'createdDate', 'createdBy'];

  constructor(
    private bugService: BugService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<BugInfoBoxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.description = "Attached Tickets";
    this.previousProject = data.clientProject;
    this.organization = data.clientOrg;
    this.testCaseId = data.testCaseId;
  }

  ngOnInit() {
    this.getAllAttachedTickets();
  }

  close() {
    this.dialogRef.close();
  }

  getAllAttachedTickets() {
    this.bugService.getAllAttachedBugs(this.testCaseId)
      .subscribe(
        result => {
          result.forEach(bug => {
            if (bug.bugType === "Production") {
              this.releaseProdBugs.push(bug);
            }
            else if (bug.bugType === "Normal") {
              this.releaseNormalBugs.push(bug);
            }
          });
        });
  }

  openHelpFor(helpId: number) {
    let dialogRef = this.dialog.open(HelpPopupComponent, {
      width: '50%',
      height: '50%',
      data: {
        // createdBy: this.loginService.getUserInformationFromLocalStorage().userName,
        clientOrganization: this.organization,
        helpId: helpId
      }

    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log("## " + result)
      if (result == "Ok") {
        // this.commonService.openNotificationBar("Project has been added successfully", "notification_important", "normal");
      }
    });
  }

}
