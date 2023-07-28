import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EnterLeave, fadeInOut } from '../animations';
import { HelpPopupComponent } from '../help-popup/help-popup.component';
import { Release } from '../release';
import { ReleaseMappingService } from '../release-mapping.service';
import { BugService } from '../bug.service';
import { EnvironmentService } from "../environment.service";
import { Environment } from '../environment';

@Component({
  selector: 'app-attach-bug',
  templateUrl: './attach-bug.component.html',
  styleUrls: ['./attach-bug.component.css'],
  animations: [
    fadeInOut, EnterLeave
  ]
})
export class AttachBugComponent implements OnInit {

  form: FormGroup;
  description: string;
  previousProject: number;
  organization: string;

  releaseAllArr: Release[] = [];
  bugTypelArr = ["Normal", "Production"];
  environmentInfoArr: Environment[] = [];
  isLoading = false;

  constructor(
    private releaseMappingService: ReleaseMappingService,
    private bugService: BugService,
    private environmentService: EnvironmentService,
    private dialog: MatDialog,
    fb: FormBuilder,
    public dialogRef: MatDialogRef<AttachBugComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    // console.log("::::::: " + JSON.stringify(data.row))
    this.description = "Attach Ticket";

    this.form = fb.group({
      testCaseId: [data.row.testCaseSequenceId],
      bugId: ["", Validators.required],
      releaseId: [0, Validators.required],
      remarks: [""],
      bugType: [0, Validators.required],
      applicable: [true],
      createdBy: [data.row.createdBy],
      modifiedBy: [data.modifiedBy],
      testCaseVersionId: [data.row.latestVersion],
      executionEnvId: [0, Validators.required]
    });

    this.previousProject = data.clientProject;
    this.organization = data.clientOrg;
  }

  ngOnInit() {
    this.getAllRelease();
    this.getAllEnvInfo();
  }

  close() {
    this.dialogRef.close();
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

  getAllRelease(): void {
    this.releaseMappingService.getAllReleaseInfo(this.previousProject, "true").subscribe(result => {
      this.releaseAllArr = result;
      if (this.releaseAllArr.length > 0) {
        this.form.value.selectedRelease = 0;
        // this.pullPreviouslyMappedRelease();
      }
    });

  }

  save() {
    this.isLoading = true;
    this.bugService.addReleaseBug(this.previousProject, this.form.value)
      .subscribe(
        result => {
          this.isLoading = false;
          this.dialogRef.close("Ok");
        });
  }

  getAllEnvInfo() {
    this.environmentService.getAllEnvironmentInfo()
      .subscribe(
        result => {
          this.environmentInfoArr = result;
        });
  }

}
