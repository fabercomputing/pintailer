import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatChipInputEvent } from '@angular/material';
import { ENTER, COMMA, SPACE } from '@angular/cdk/keycodes';
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import { TestcaseDefinitionService } from '../testcase-definition.service';
import { LoginService } from "../login.service"
import { ClientProjectService } from '../client-project.service'
import { ModuleService } from '../module.service'
import { ClientProject } from '../client-project'
import { Module } from '../module'
import { MatDialog } from '@angular/material';
import { ModuleSelectionComponent } from '../module-selection/module-selection.component';

@Component({
  selector: 'app-testcase-definition-add-dialog',
  templateUrl: './testcase-definition-add-dialog.component.html',
  styleUrls: ['./testcase-definition-add-dialog.component.css']
})
export class TestcaseDefinitionAddDialogComponent implements OnInit {

  form: FormGroup;
  description: string;
  visible: boolean = true;
  selectable: boolean = true;
  removable: boolean = true;
  addOnBlur: boolean = true;
  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA, SPACE];
  booleanEnum = [true, false];
  tags = [];
  organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  organization: string = this.organizations[0];
  clientProjects: ClientProject[] = [];
  clientProjectId: number;
  modules: Module[] = [];

  previousProject: number;

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private testcaseDefinitionService: TestcaseDefinitionService,
    private loginService: LoginService,
    private clientProjectService: ClientProjectService,
    private moduleService: ModuleService,
    public dialogRef: MatDialogRef<TestcaseDefinitionAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.description = "Add Test Case Definition";


    this.form = fb.group({
      testCaseNo: [''],
      testData: [''],
      moduleId: ['', Validators.required],
      testSummary: ['', Validators.required],
      preCondition: [''],
      tags: [''],
      executionSteps: [''],
      expectedResult: [''],
      linkedDefect: [''],
      automatable: [true],
      remarks: [''],
      fileName: [''],
      automatedTestCaseNoFromFile: [''],
      manualReason: [''],
      applicable: [true],
      createdBy: [data.createdBy],
      modifiedBy: [data.createdBy]
    });

    this.previousProject = data.clientProject;
    this.organization = data.clientOrg;

  }

  ngOnInit() {
    this.selectProjectWhenLoad(this.organization);
  }

  selectProjectWhenLoad(organization: string) {
    this.clientProjectService.getClientProjects()
      .subscribe(
        result => {
          if (result.length != 0) {
            this.clientProjects = result;
            let projectFound = false;
            // If project selected on Test Definition is available then select it, otherwise select the first project
            this.clientProjects.forEach(project => {
              if (project.clientProjectId === this.previousProject) {
                this.clientProjectId = project.clientProjectId;
                // this.selectedProjectName = project.name;
                projectFound = true;
              }
            });
            if (!projectFound) {
              this.clientProjectId = this.clientProjects[0].clientProjectId;
              // this.selectedProjectName = this.clientProjects[0].name;
            }
          }

          this.getModulesByProjectId(this.clientProjectId);

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

  removeTags(tag: any): void {
    let index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  getProjectsByOrganizationName(name: string) {
    this.organization = name;
    this.clientProjectService.getClientProjects()
      .subscribe(
        result => {
          this.clientProjects = result;
        });
  }

  getModulesByProjectId(projectId: number) {
    this.clientProjectId = projectId;
    this.previousProject = projectId;
    this.moduleService.getModules(projectId)
      .subscribe(
        result => {
          this.modules = result;
        });
  }

  save() {
    let trimedArr: string[] = [];
    if (this.tags.length > 0) {
      trimedArr = this.tags.map(str => str.trim());
    }

    this.form.value.tags = trimedArr;
    this.testcaseDefinitionService.addTestCaseDefinition(this.form.value)
      .subscribe(
        result => {
          this.dialogRef.close("Ok");
        });
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

}
