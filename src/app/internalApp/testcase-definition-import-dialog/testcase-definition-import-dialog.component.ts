import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { forkJoin } from 'rxjs';

import { TestcaseDefinitionService } from '../testcase-definition.service';
import { ClientProject } from '../client-project'
import { UserProfileDetail } from '../user'
import { ClientProjectService } from '../client-project.service'
import { TestCaseDefinitionImport } from '../testcase-definition';
import { LoginService } from "../login.service"
import { CommonService } from '../common.service'
import { HelpPopupComponent } from '../help-popup/help-popup.component'
import { MatDialog } from '@angular/material';
import { UploadEvent, UploadFile, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';

@Component({
  selector: 'app-testcase-definition-import-dialog',
  templateUrl: './testcase-definition-import-dialog.component.html',
  styleUrls: ['./testcase-definition-import-dialog.component.css']
})
export class TestcaseDefinitionImportDialogComponent implements OnInit {

  @ViewChild('file') file;
  public files: Set<File> = new Set();
  public filesUpload: UploadFile[] = [];
  progress;
  canBeClosed: boolean = false;
  primaryButtonText: string = 'Import';
  showCancelButton: boolean = true;
  uploading: boolean = false;
  uploadSuccessful: boolean = false;
  clientProjects: ClientProject[] = [];
  clientProjectId: number;
  // organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  organization: string = this.loginService.getUserInformationFromLocalStorage().defaultOrganization;
  userProfileDetail: UserProfileDetail;
  selectedProjectName: string;
  fileTypes: string[] = ['CSV', 'FEATURE', 'JAVA'];

  previousProject: number;

  constructor(private commonService: CommonService, public dialog: MatDialog,
    private testcaseDefinitionService: TestcaseDefinitionService,
    private clientProjectService: ClientProjectService,
    private loginService: LoginService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TestcaseDefinitionImportDialogComponent>
  ) {
    this.previousProject = data.clientProject;
    this.organization = data.clientOrg;
  }

  ngOnInit() {
    this.selectProjectWhenLoad(this.organization);
    // this.getProjectList(this.organization);
  }

  selectProjectWhenLoad(organization: string) {
    this.clientProjectService.getClientProjects()
      .subscribe(
        result => {
          if (result.length != 0) {
            this.clientProjects = result;
            let projectFound = false;
            this.clientProjects.forEach(project => {
              if (project.clientProjectId === this.previousProject) {
                this.clientProjectId = project.clientProjectId;
                this.selectedProjectName = project.name;
                projectFound = true;
              }
            });
            if (!projectFound) {
              this.clientProjectId = this.clientProjects[0].clientProjectId;
              this.selectedProjectName = this.clientProjects[0].name;
            }
          }

        });
  }

  addFiles() {
    this.file.nativeElement.click();
  }

  public dropped(event: UploadEvent) {
    this.filesUpload = event.files;
    for (const droppedFile of event.files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {

          // Here you can access the real file
          console.log(droppedFile.relativePath, file);
          if (file && file.name.endsWith(".java")) {
            this.files.add(file);
            this.canBeClosed = this.files.size > 0 ? true : false;
          }

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }

  public fileOver(event) {
    console.log(event);
  }

  public fileLeave(event) {
    console.log(event);
  }

  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;
    for (let key in files) {
      if (!isNaN(parseInt(key))) {
        if (files[key].size < 15000000) {
          if (this.checkFileExtension(files[key]["name"])) {
            this.files.add(files[key]);
          } else {
            this.commonService.openNotificationBar("Please select from compatible file types: [csv or feature]", "error", "normal");
          }
        } else {
          this.commonService.openNotificationBar("Please select a file less than 15 MB.", "error", "normal");
        }
      }
    }
    this.canBeClosed = this.files.size > 0 ? true : false;
  }

  checkFileExtension(filename: string) {
    const fileExt = filename.split('.').pop();
    if (this.fileTypes.includes(fileExt.toUpperCase())) {
      return true;
    }
    else {
      return false;
    }

  }

  uploadFile() {

    // if everything was uploaded already, just close the dialog
    if (this.uploadSuccessful) {
      return this.dialogRef.close();
    }

    // set the component state to "uploading"
    this.uploading = true;

    // Define Other attr to send with the file
    let otherAttribute = new TestCaseDefinitionImport();
    let clientProject = new ClientProject();
    clientProject.clientOrganization = this.organization;
    clientProject.clientProjectId = this.clientProjectId;
    clientProject.name = this.selectedProjectName;
    this.userProfileDetail = this.loginService.getUserInformationFromLocalStorage();

    otherAttribute.project = clientProject;
    otherAttribute.userName = this.userProfileDetail.userName;

    let clientProjectIdForApi = this.clientProjectId;

    // start the upload and save the progress map

    this.progress = this.testcaseDefinitionService.importTestCaseDefinitionFile(this.files, clientProjectIdForApi);

    // convert the progress map into an array
    let allProgressObservables = [];
    for (let key in this.progress) {
      allProgressObservables.push(this.progress[key].progress);
    }

    // Adjust the state variables

    // The OK-button should have the text "Finish" now
    this.primaryButtonText = 'Finish';

    // The dialog should not be closed while uploading
    this.canBeClosed = false;
    this.dialogRef.disableClose = true;

    // Hide the cancel-button
    //this.showCancelButton = false;

    // When all progress-observables are completed...
    forkJoin(allProgressObservables).subscribe(end => {
      // ... the dialog can be closed again...
      this.canBeClosed = true;
      this.dialogRef.disableClose = false;

      // ... the upload was successful...
      this.uploadSuccessful = true;

      // ... and the component is no longer uploading
      this.uploading = false;
    });

  }

  closeDialog() {

    if (this.primaryButtonText === "Upload") {
      if (window.confirm("You have selected following values. Organization:[" + this.organization + "], Project:[" + this.selectedProjectName + "]. Please verify carefully")) {
        this.uploadFile();

      }
    }
    else {
      this.uploadFile();
    }

  }

  getProjectList(organizationName) {
    this.clientProjectService.getClientProjects()
      .subscribe(
        result => {
          if (result.length != 0) {
            this.clientProjects = result;
            this.clientProjectId = this.clientProjects[0].clientProjectId;
            this.selectedProjectName = this.clientProjects[0].name;
          }

        });
  }

  showSampleCsvFile() {
    window.open('../assets/downloads/SampleTestCasesFile.csv');
  }

  doSimilarityCheck() {
    let filename = "";
    this.files.forEach(element => {
      filename = element.name;
    });

    let max = 0;

    this.clientProjects.forEach(element => {
      let sim = this.similarity(filename, element.name);
      if (sim > max) {
        max = this.similarity(filename, element.name);
        this.clientProjectId = element.clientProjectId;

        this.selectProjectName(element.name)
      }
    });

  }

  similarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    let longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength);
  }

  editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    let costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  selectProjectName(value: string) {
    this.selectedProjectName = value;
  }

  closeButton() {
    this.dialogRef.close("cancel");
  }

  removeFile(file: any) {
    this.files.delete(file);
    this.canBeClosed = this.files.size > 0 ? true : false;
  }

  openHelpFor(helpId: number) {
    let dialogRef = this.dialog.open(HelpPopupComponent, {
      width: '50%',
      height: '50%',
      data: {
        createdBy: this.loginService.getUserInformationFromLocalStorage().userName,
        clientOrganization: this.organization,
        helpId: helpId
      }

    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log("## " + result)
      if (result == "Ok") {
        this.commonService.openNotificationBar("Project has been added successfully", "notification_important", "normal");
      }
    });
  }


}
