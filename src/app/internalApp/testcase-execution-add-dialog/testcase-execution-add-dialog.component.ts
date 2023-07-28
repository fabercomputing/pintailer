import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { UserProfileDetail } from '../user'
import { LoginService } from "../login.service"
import { EnvironmentService } from "../environment.service";
import { TestcaseExecutionService } from '../testcase-execution.service';
import { Environment } from "../environment";
import { Release } from "../release";
import { ReleaseMappingService } from '../release-mapping.service'
import { CommonService } from '../common.service'

export interface PossibleResult {
  value: string;
}

@Component({
  selector: 'app-testcase-execution-add-dialog',
  templateUrl: './testcase-execution-add-dialog.component.html',
  styleUrls: ['./testcase-execution-add-dialog.component.css']
})

export class TestcaseExecutionAddDialogComponent implements OnInit {

  form: FormGroup;
  description: string;
  events: string[] = [];
  userProfileDetail: UserProfileDetail;
  releaseAllArr: Release[] = [];
  organization: string;
  clientProjectId: number;

  possibleResults: PossibleResult[] = [
    { value: 'BLOCKED' },
    { value: 'FAILED' },
    { value: 'IN_PROCESS' },
    { value: 'NOT_TESTED' },
    { value: 'PASSED' },
    { value: 'SKIPPED' }
  ];

  constructor(
    private fb: FormBuilder, private loginService: LoginService, private environmentService: EnvironmentService, private commonService: CommonService,
    private testcaseExecutionService: TestcaseExecutionService, private releaseMappingService: ReleaseMappingService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TestcaseExecutionAddDialogComponent>) {

    this.organization = data.selectedOrg;
    this.clientProjectId = data.clientProject;

    this.description = "Add Test Case Execution Result";

    this.userProfileDetail = this.loginService.getUserInformationFromLocalStorage();

    this.form = fb.group({
      testCaseId: [data.row.testCaseSequenceId],
      testRunBy: [this.userProfileDetail.userName],
      actualResult: [''],
      executionDate: [new Date(), Validators.required],
      testResult: ['', Validators.required],
      environmentId: ['', Validators.required],
      releaseId: ['', Validators.required],
      actualLOE: ['', Validators.required],
      createdBy: [data.row.createdBy],
      modifiedBy: [data.row.modifiedBy],
      linkedBug: [data.row.linkedBug],
      testStepId: [0]
    });
  }

  currentDate: Date;
  // organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;

  environmentInfoArr: Environment[] = [];

  ngOnInit() {
    this.currentDate = new Date();
    this.getAllEnvInfo();
    this.getAllRelease();

  }

  save() {
    // this.form.value.actualResult = this.form.value.testResult;
    this.testcaseExecutionService.addTestCaseExecution(this.form.value)
      .subscribe(
        result => {
          this.dialogRef.close("Ok");
        });
  }

  close() {
    this.dialogRef.close();
  }

  getAllEnvInfo() {
    this.environmentService.getAllEnvironmentInfo()
      .subscribe(
        result => {
          this.environmentInfoArr = result;
        });
  }

  getAllRelease(): void {

    this.releaseMappingService.getAllReleaseInfo(this.clientProjectId, "true").subscribe(result => {
      this.releaseAllArr = result;
    });

  }

  getSpecificExecutionsDetails() {
    if (this.form.value.releaseId >= 1 && this.form.value.environmentId >= 1) {

      this.testcaseExecutionService.getSpecificTestCaseExecutionsDetails(0, this.form.value.testCaseId, this.form.value.releaseId, this.form.value.environmentId)
        .subscribe(
          result => {
            if (result != null) {
              this.commonService.openNotificationBar("Auto-Filling the last Execution Details", "notification_important", "normal");
              this.form.get('testResult').setValue(result.testResult);
              this.form.get('actualResult').setValue(result.actualResult);
              this.form.get('executionDate').setValue(new Date(result.executionDate));
              this.form.get('linkedBug').setValue(result.linkedBug);
              this.form.get('actualLOE').setValue(result.actualLOE);
            } else {
              this.commonService.openNotificationBar("No past Execution details found for selected Environment and Release", "warning", "normal");
              this.form.get('testResult').setValue("");
              this.form.get('actualResult').setValue("");
              this.form.get('executionDate').setValue("");
              this.form.get('linkedBug').setValue("");
              this.form.get('actualLOE').setValue("");
            }
          });
    }
  }

  readOnlyFieldEdited() {
    this.commonService.openNotificationBar("This is Non-Editable Summary of Test Case, Add the Execution Result in the form below.", "warning", "normal");
  }

}
