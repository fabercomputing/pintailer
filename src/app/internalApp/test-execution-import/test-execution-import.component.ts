import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { forkJoin } from 'rxjs';

import { TestcaseExecutionService } from '../testcase-execution.service';
import { ClientProject } from '../client-project'
import { UserProfileDetail } from '../user'
import { ClientProjectService } from '../client-project.service'
import { TestCaseDefinitionImport } from '../testcase-definition';
import { LoginService } from "../login.service"
import { EnvironmentService } from "../environment.service";
import { Environment } from "../environment";
import { Release } from "../release";
import { ReleaseMappingService } from '../release-mapping.service'
import { CommonService } from '../common.service'

@Component({
  selector: 'app-test-execution-import',
  templateUrl: './test-execution-import.component.html',
  styleUrls: ['./test-execution-import.component.css']
})
export class TestExecutionImportComponent implements OnInit {

  @ViewChild('file') file;
  public files: Set<File> = new Set();
  progress;
  canBeClosed: boolean = false;
  primaryButtonText: string = 'Import';
  showCancelButton: boolean = true;
  uploading: boolean = false;
  uploadSuccessful: boolean = false;
  clientProjects: ClientProject[] = [];
  clientProjectId: number;
  fileTypes: string[] = ['JSON', 'XML', 'CSV'];
  fileTypeJSON: string = this.fileTypes[0];
  fileTypeXML: string = this.fileTypes[1];
  fileTypeCSV: string = this.fileTypes[2];
  // organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  organization: string = this.loginService.getUserInformationFromLocalStorage().defaultOrganization;
  userProfileDetail: UserProfileDetail;
  environmentInfoArr: Environment[] = [];
  selectedEnvironment: number;
  selectedEnvironmentName: string;
  releaseAllArr: Release[] = [];
  selectedRelease: string;
  selectedReleaseID: number;
  isSyncCheck = false;

  previousProject: number;

  constructor(
    private commonService: CommonService,
    private testcaseExecutionService: TestcaseExecutionService,
    private releaseMappingService: ReleaseMappingService,
    private clientProjectService: ClientProjectService,
    private environmentService: EnvironmentService,
    private loginService: LoginService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TestExecutionImportComponent>
  ) {
    this.previousProject = data.clientProject;
    this.organization = data.clientOrg;
  }

  ngOnInit() {
    // this.getProjectList(this.organization);
    this.selectProjectWhenLoad(this.organization);
    this.getAllEnvInfo();
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

                this.getAllRelease();
                // this.selectedProjectName = project.name;
                projectFound = true;
              }
            });
            if (!projectFound) {
              this.clientProjectId = this.clientProjects[0].clientProjectId;
              this.getAllRelease();
              // this.selectedProjectName = this.clientProjects[0].name;
            }
          }

        });
  }

  addFiles() {
    this.file.nativeElement.click();
  }

  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;
    for (let key in files) {
      if (!isNaN(parseInt(key))) {
        if (this.checkFileExtension(files[key]["name"])) {
          this.files.add(files[key]);
        } else {
          this.commonService.openNotificationBar("Please select from compatible file types: ['JSON', 'XML', 'CSV']", "error", "normal");
        }
      }
    }
    this.canBeClosed = this.files.size > 0 ? true : false;
  }

  checkFileExtension(filename: string) {
    const fileExt = filename.split('.').pop();
    if (this.fileTypeJSON.toLowerCase() == fileExt) {
      return true;
    }
    else if (this.fileTypeXML.toLowerCase() == fileExt) {
      return true;
    } else if (this.fileTypeCSV.toLowerCase() == fileExt) {
      return true;
    }
    else {
      return false;
    }

  }

  closeDialog() {
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
    this.userProfileDetail = this.loginService.getUserInformationFromLocalStorage();

    otherAttribute.project = clientProject;
    otherAttribute.userName = this.userProfileDetail.userName;

    otherAttribute.environmentId = + this.selectedEnvironment;
    otherAttribute.environment = this.selectedEnvironmentName

    otherAttribute.releaseId = + this.selectedReleaseID;
    otherAttribute.releaseName = this.selectedRelease;

    let clientProjectIdForApi = this.clientProjectId;
    let environmentIdForApi = this.selectedEnvironment;
    let releaseIdForApi = this.selectedReleaseID;

    // start the upload and save the progress map

    this.progress = this.testcaseExecutionService.importTestCaseExecutionnFile(this.files, clientProjectIdForApi, environmentIdForApi, releaseIdForApi, this.isSyncCheck);

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

  getProjectList(organizationName) {
    this.clientProjectService.getClientProjects()
      .subscribe(
        result => {
          if (result.length != 0) {
            this.clientProjects = result;
            this.clientProjectId = this.clientProjects[0].clientProjectId;
          }

        });
  }

  showSampleCsvFile() {
    window.open('https://drive.google.com/open?id=1-6ThiCxsx571vxkGO8IuXcVQ-Q1daqkS');
  }

  getAllEnvInfo() {
    this.environmentService.getAllEnvironmentInfo()
      .subscribe(
        result => {
          this.environmentInfoArr = result;
          if(this.environmentInfoArr && Array.isArray(this.environmentInfoArr) && this.environmentInfoArr.length > 0){
            this.selectedEnvironment = this.environmentInfoArr[0].executionEnvId;
          }
        });
  }

  saveEnvData(envName: string) {
    this.selectedEnvironmentName = envName;
  }

  getAllRelease(): void {
    this.releaseMappingService.getAllReleaseInfo(this.clientProjectId, "true").subscribe(result => {
      this.releaseAllArr = result;
      if(this.releaseAllArr && Array.isArray(this.releaseAllArr) && this.releaseAllArr.length > 0){
        this.selectedRelease = this.releaseAllArr[0].releaseNumber;
        this.saveReleaseData(this.releaseAllArr[0].releaseId);
      }
    });

  }

  saveReleaseData(relName: number) {
    this.selectedReleaseID = relName;
  }

  removeFile(file: any) {
    this.files.delete(file);
    this.canBeClosed = this.files.size > 0 ? true : false;
  }

}
