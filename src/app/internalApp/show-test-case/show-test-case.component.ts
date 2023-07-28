import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatChipInputEvent } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { ENTER, COMMA, SPACE } from '@angular/cdk/keycodes';

import { TestcaseDefinitionService } from '../testcase-definition.service';
import { ModuleService } from '../module.service'
import { Module } from '../module'
import { MatDialog } from '@angular/material';
import { ModuleSelectionComponent } from '../module-selection/module-selection.component';
import { HelpPopupComponent } from '../help-popup/help-popup.component'
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material';
import { CommonService } from '../common.service'
import { Release } from '../release';
import { ReleaseMappingService } from '../release-mapping.service';
import * as lodash from 'lodash';
import { fadeInOut, EnterLeave } from '../animations';

@Component({
  selector: 'app-show-test-case',
  templateUrl: './show-test-case.component.html',
  styleUrls: ['./show-test-case.component.css'],
  animations: [
    fadeInOut, EnterLeave
  ]
})
export class ShowTestCaseComponent implements OnInit {

  form: FormGroup;
  formClone: FormGroup;
  description: string;
  visible: boolean = true;
  selectable: boolean = true;
  removable: boolean = true;
  addOnBlur: boolean = true;

  // tag variables
  @ViewChild('chipInput') chipInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  separatorKeysCodes = [ENTER, COMMA, SPACE];
  availableTags: string[] = ['Bug_In_Production', 'P1', 'P2', 'P3', 'P4'];
  booleanEnum = [true, false];
  tags: string[] = [];

  oldFileName = "";
  modules: Module[] = [];

  previousProject: number;
  organization: string;

  releaseAllArr: Release[] = [];

  changeDone = false;

  constructor(
    private releaseMappingService: ReleaseMappingService,
    private commonService: CommonService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private moduleService: ModuleService,
    private testcaseDefinitionService: TestcaseDefinitionService,
    public dialogRef: MatDialogRef<ShowTestCaseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.description = "Test Case Details";
    let allTags: string = data.row.tags + '';
    if (allTags != "") {
      let tagArray = allTags.split(',');
      tagArray.forEach(element => {
        this.tags.push(element);
      });
    }
    this.oldFileName = data.row.fileName;

    this.form = fb.group({
      testCaseId: [data.row.testCaseSequenceId],
      testCaseNo: [data.row.testCaseNo],
      testData: [data.row.testData],
      moduleId: [data.row.moduleId, Validators.required],
      testSummary: [data.row.testSummary, Validators.required],
      preCondition: [data.row.preCondition],
      tags: [''],
      executionSteps: [data.row.executionSteps],
      expectedResult: [data.row.expectedResult],
      linkedDefect: [data.row.linkedDefect],
      automatable: [data.row.automatable],
      remarks: [data.row.remarks],
      fileName: [data.row.fileName],
      automatedTestCaseNoFromFile: [data.row.automatedTestCaseNoFromFile],
      manualReason: [data.row.manualReason],
      applicable: [data.row.applicable],
      createdBy: [data.row.createdBy],
      modifiedBy: [data.modifiedBy],
      deleted: [data.row.deleted],
      selectedRelease: [0]
    });

    this.previousProject = data.clientProject;
    this.organization = data.clientOrg;

    this.formClone = lodash.clone(this.form);
    let trimedArr: string[] = [];
    if (this.tags.length > 0) {
      trimedArr = this.tags.map(str => str.trim());
    }
    this.formClone.value.tags = trimedArr;
  }

  ngOnInit() {
    this.getModulesByProjectId(this.previousProject);
    this.getAllRelease();
  }

  getModulesByProjectId(projectId: number) {
    this.moduleService.getModules(projectId)
      .subscribe(
        result => {
          this.modules = result;
        });
  }

  addTags(event: MatChipInputEvent): void {
    let input = event.input;
    let value = event.value;

    // Add tag
    if ((value || '').trim()) {
      this.tags.push(value);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  chipAutoSelect(event: MatAutocompleteSelectedEvent): void {
    let value = event.option.viewValue;
    // Add tag
    if ((value || '').trim()) {
      this.tags.push(value);
    }

    this.chipInput.nativeElement.value = '';
    // this.fruitCtrl.setValue(null);
  }

  removeTags(tag: any): void {
    let index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  save() {

    let trimedArr: string[] = [];
    if (this.tags.length > 0) {
      trimedArr = this.tags.map(str => str.trim());
    }

    this.form.value.tags = trimedArr;

    // console.log(this.form.value.testSummary + " ::::::::::::::: " + this.formClone.value.testSummary)
    let testSummary = this.form.value.testSummary.trim() === this.formClone.value.testSummary.trim();
    let testCaseNo = this.form.value.testCaseNo.trim() === this.formClone.value.testCaseNo.trim();
    let testData = this.form.value.testData.trim() === this.formClone.value.testData.trim();
    let moduleId = this.form.value.moduleId === this.formClone.value.moduleId;
    let preCondition = this.form.value.preCondition.trim() === this.formClone.value.preCondition.trim();
    let tags = lodash.isEqual(this.form.value.tags.sort(), this.formClone.value.tags.sort())
    let executionSteps = this.form.value.executionSteps.trim() === this.formClone.value.executionSteps.trim();
    let expectedResult = this.form.value.expectedResult.trim() === this.formClone.value.expectedResult.trim();
    let automatable = this.form.value.automatable === this.formClone.value.automatable;
    let remarks = this.form.value.remarks.trim() === this.formClone.value.remarks.trim();
    let manualReason = this.form.value.manualReason.trim() === this.formClone.value.manualReason.trim();

    if (testSummary && testCaseNo && testData && moduleId && preCondition && tags && executionSteps && expectedResult && automatable && remarks && manualReason) {
      this.changeDone = false;
    } else {
      this.changeDone = true;
    }

    if (this.oldFileName != null) {
      if (this.oldFileName.length > 0) {
        this.form.value.fileName = this.oldFileName + ":" + this.form.value.fileName;
      }
    }

    if (this.showReleaseSelection()) {
      this.form.value.selectedRelease = 0;
    }

    if (!this.showAutomatedFile()) {
      this.form.value.automatedTestCaseNoFromFile = "";
    }

    if (this.canProperFileNameChecks()) {
      this.testcaseDefinitionService.updateTestCaseDefinition(this.form.value, this.form.value.selectedRelease, this.changeDone)
        .subscribe(
          result => {
            this.dialogRef.close("Ok");
          });
    }
  }

  canProperFileNameChecks() {
    if (this.showAutomatedFile()) {
      let automatedTestCaseNoFromFilebool = this.form.value.automatedTestCaseNoFromFile != null ? this.form.value.automatedTestCaseNoFromFile.trim() === "" : true;
      if (automatedTestCaseNoFromFilebool) {
        this.commonService.openNotificationBar('Automated TestCase No. From File must have value if File name is mentioned', 'error', 'normal');
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  close() {
    this.dialogRef.close();
  }

  openModuleSelection() {
    this.openModuleSelectionPopup("test", this.previousProject);
  }

  openModuleSelectionPopup(message: string, projectId: number) {

    let dialogRef = this.dialog.open(ModuleSelectionComponent, {
      data: {
        moduleDataReceived: message,
        moduleProjectReceived: projectId
      },
      disableClose: true,
      panelClass: 'module-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != "cancel") {
        this.form.controls['moduleId'].setValue(result.nodeId);
      }
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

  validateDeleteTestCase(deletedFlag: boolean) {
    if (deletedFlag) {
      this.commonService.openNotificationBar('Test Case will be permanently deleted if deleted Flag is set to True!', 'warning', 'normal');
    }
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

  showReleaseSelection() {
    let fileNameBool = this.form.value.fileName != null ? this.form.value.fileName.trim() === "" : true
    let automatedTestCaseNoFromFilebool = this.form.value.automatedTestCaseNoFromFile != null ? this.form.value.automatedTestCaseNoFromFile.trim() === "" : true
    return fileNameBool || automatedTestCaseNoFromFilebool;
  }

  showAutomatedFile() {
    let fileNameBool = this.form.value.fileName != null ? this.form.value.fileName.trim() === "" : true;
    return !fileNameBool;
  }

}
