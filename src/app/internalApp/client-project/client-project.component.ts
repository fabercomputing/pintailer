import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { MatDialog } from '@angular/material';

import { ClientProject } from '../client-project'
import { ClientProjectService } from '../client-project.service'
import { LoginService } from "../login.service"
import { ClientProjectEditComponent } from '../client-project-edit/client-project-edit.component'
import { ClientProjectDeleteComponent } from '../client-project-delete/client-project-delete.component'
import { UserProfileDetail } from '../user'
import { Release } from "../release";
import { ReleaseMappingService } from '../release-mapping.service'
import { EnvironmentService } from "../environment.service";
import { Environment } from "../environment";
import { ActivatedRoute } from '@angular/router';
import introJs from 'intro.js';
import { Router } from '@angular/router';
import { NotificationComponent } from '../../notification/notification.component';

@Component({
  selector: 'app-client-project',
  templateUrl: './client-project.component.html',
  styleUrls: ['./client-project.component.css']
})
export class ClientProjectComponent implements OnInit {

  clientProjects: MatTableDataSource<ClientProject>;
  displayedColumns = ['name', 'clientOrganization', 'createdBy', 'modifiedBy', 'actions'];

  // organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  organization: string = this.loginService.getUserInformationFromLocalStorage().defaultOrganization;
  clientProjectsList: ClientProject[] = [];
  clientProjectId: number;
  newProjectName: string;

  userProfileDetail: UserProfileDetail = this.loginService.getUserInformationFromLocalStorage();;
  selectedReleaseNo: string;
  selectedEnvironmentNo: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  releaseAllArr: MatTableDataSource<Release>;
  displayedColumnsRelease = ['Number', 'Organization', 'ClosedFlag', 'Actions'];
  @ViewChild("paginatorRelease") paginatorRelease: MatPaginator;
  @ViewChild("sortRelease") sortRelease: MatSort;

  environmentInfoArr: MatTableDataSource<Environment>;
  displayedColumnsEnv = ['Name', 'Organization'];
  @ViewChild("paginatorEnv") paginatorEnv: MatPaginator;
  @ViewChild("sortEnv") sortEnv: MatSort;

  intro = introJs();
  paramintroJs: string = "";
  tourButtonInterval: any;

  projectExpanded = false;
  releaseExpanded = false;
  envExpanded = false;

  constructor(
    private clientProjectService: ClientProjectService,
    private loginService: LoginService,
    private environmentService: EnvironmentService,
    private releaseMappingService: ReleaseMappingService,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    public router: Router,
  ) { }

  ngOnInit() {
    this.getClientProjects();
    // this.getProjectsByOrganizationName(this.organization);

    // this.tourButtonInterval = setInterval(this.tourButtonTimer, 15000);
    if (this.activatedRoute.snapshot.queryParamMap.get('appWalkthroughIntro') != null) {
      this.paramintroJs = this.activatedRoute.snapshot.queryParamMap.get('appWalkthroughIntro');
    }

    if (this.paramintroJs === "true") {
      // this.tourButtonInterval = setTimeout(this.expandAllBox.bind(this), 1000);
      document.getElementById('introSetupButtonTitle').click();
      this.tourButtonInterval = setTimeout(this.startTour.bind(this), 1000);
    }

  }

  expandAllBox() {
    this.projectExpanded = true;
    this.releaseExpanded = true;
    this.envExpanded = true;
  }

  colapseAllBox() {
    this.projectExpanded = false;
    this.releaseExpanded = false;
    this.envExpanded = false;
  }

  startTour() {

    let currentRouter = this.router;
    let currentTourEnd = false;
    let currentexpandAllBox = this.expandAllBox.bind(this);
    let currentcolapseAllBox = this.colapseAllBox.bind(this);

    this.intro.setOptions({
      steps: [
        {
          element: '#introAddProjectTitle',
          intro: 'Add/Edit/View new or existing projects associated with your Organization',
          position: 'left',
          tooltipclass: 'forLastStep'
        },
        {
          element: '#introAddProjectFormTitle',
          intro: 'Add a New project by providing a Name in the Text box and click on Add New Project button.',
          position: 'right'
        },
        {
          element: '#introEditProjectTitle',
          intro: 'View and Edit the details of your existing projects',
          position: 'right'
        },
        {
          element: '#introAddReleaseTitle',
          intro: 'Add/Edit/View new or existing Releases associated with your Projects',
          position: 'right'
        },
        {
          element: '#introAddReleaseProjectSelectTitle',
          intro: 'Select the Project for which you want to add a Release',
          position: 'right'
        },
        {
          element: '#introAddReleaseFormTitle',
          intro: 'Add a New Release by providing a Name in the Text box and click on Add New Release button',
          position: 'right'
        },
        {
          element: '#introEditReleaseTitle',
          intro: 'View and Edit the details of your existing releases',
          position: 'right'
        },
        {
          element: '#introAddEnvTitle',
          intro: 'Add/Edit/View new or existing environments associated with your organization',
          position: 'right'
        },
        {
          element: '#introAddEnvFormTitle',
          intro: 'Add a New Environment by providing a Name in the Text box and click on Add New Environment button.',
          position: 'right'
        },
        {
          element: '#introEditEnvTitle',
          intro: 'View and Edit the details of your existing environments',
          position: 'right'
        }
      ],
      showBullets: true,
      showButtons: true,
      exitOnOverlayClick: false,
      keyboardNavigation: true,
      disableInteraction: true,
      showProgress: false,
      hideNext: true,
      hidePrev: true
    });
    this.intro.setOption('doneLabel', 'Next page').onchange(function (targetElement) {
      console.log(targetElement.id);
      switch (targetElement.id) {
        case "introAddProjectFormTitle":
          // currentexpandAllBox();
          break;
        // case "introAddReleaseTitle":
        //   currentcolapseAllBox();
        //   break;
        // case "introAddReleaseProjectSelectTitle":
        //   currentexpandAllBox();
        //   break;
        // case "introAddEnvTitle":
        //   currentcolapseAllBox();
        //   break;
        // case "introAddEnvFormTitle":
        //   currentexpandAllBox();
        //   break;
      }
    }).start().onexit(function () {
      if (!currentTourEnd) {
        currentRouter.navigate(['/app/projectSetup']);
      }
    }).oncomplete(function () {
      currentTourEnd = true;
      currentRouter.navigate(['/dashBoard'], { queryParams: { appWalkthroughIntro: "TestCaseDefinitions" } });
    });

  }

  ngOnDestroy() {
    this.intro.exit();
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.clientProjects.filter = filterValue;
    if (this.clientProjects.paginator) {
      this.clientProjects.paginator.firstPage();
    }
  }

  editClientProject(row) {

    let dialogRef = this.dialog.open(ClientProjectEditComponent, {
      width: '500px',
      data: { row, modifiedBy: this.loginService.getUserInformationFromLocalStorage().userName }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == "Ok") this.getClientProjects();
    });
  }

  deleteClientProject(row) {
    let dialogRef = this.dialog.open(ClientProjectDeleteComponent, {
      width: '250px',
      data: { row }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == "Ok") this.getClientProjects();
    });
  }

  // Project add now shifted to same page instead of below popup save process
  // addClientProject() {
  //   let dialogRef = this.dialog.open(ClientProjectAddComponent, {
  //     width: '500px',
  //     data: {
  //       createdBy: this.loginService.getUserInformationFromLocalStorage().userName,
  //       clientOrganization: this.organization
  //     }

  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log("## " + result)
  //     if (result == "Ok") {
  //       this.getClientProjects();
  //       this.openSnackBar(`Project has been added successfully`, "Close");
  //     }
  //   });
  // }

  saveNewProject() {
    if (this.newProjectName != undefined && this.newProjectName != "") {
      let newProject = new ClientProject();
      newProject.name = this.newProjectName;
      newProject.clientOrganization = this.organization;
      newProject.createdBy = this.userProfileDetail.userName;
      newProject.modifiedBy = this.userProfileDetail.userName;
      this.clientProjectService.addClientProject(newProject)
        .subscribe(
          result => {
            this.getClientProjects();
            this.openNotificationBar(`Project ${this.newProjectName} has been added successfully`, "notification_important", "normal");
          });
    }
    else {
      this.openNotificationBar("Please enter Project Name first", "error", "normal");
    }

  }


  getClientProjects(): void {
    this.clientProjectService.getAllClientProjectsForDefaultOrg()
      .subscribe(
        clientProjects => {
          this.clientProjects = new MatTableDataSource(clientProjects);
          this.clientProjects.paginator = this.paginator;
          this.clientProjects.sort = this.sort;
          this.clientProjectsList = clientProjects;
          if (this.clientProjectsList.length > 0) {
            this.clientProjectId = this.clientProjectsList[0].clientProjectId;
          }
          this.getAllRelease();
          this.getAllEnvInfo();
        });
  }

  addRelease() {
    if (this.selectedReleaseNo != undefined) {
      let releaseInfo = new Release();
      releaseInfo.releaseNumber = this.selectedReleaseNo;
      releaseInfo.clientOrganization = this.organization;
      releaseInfo.createdBy = this.userProfileDetail.userName;
      releaseInfo.modifiedBy = this.userProfileDetail.userName;
      releaseInfo.closed = true;
      releaseInfo.clientProjectId = this.clientProjectId;
      this.releaseMappingService.addNewRelease(releaseInfo).subscribe(result => {
        this.openNotificationBar(`Release ${this.selectedReleaseNo} has been added`, "notification_important", "normal");
        this.getAllRelease();
      })
    }
    else {
      this.openNotificationBar("Please enter a release number first", "error", "normal");
    }
  }

  updateSelectedRelease(rowData: Release) {

    if (window.confirm('Are sure you want to switch closed flag for this particular release ?')) {

      let releaseInfo = new Release();
      releaseInfo.releaseNumber = rowData.releaseNumber;
      releaseInfo.modifiedBy = this.userProfileDetail.userName;
      releaseInfo.releaseId = rowData.releaseId;
      releaseInfo.closed = !rowData.closed;
      this.releaseMappingService.updateRelease(releaseInfo).subscribe(result => {
        this.openNotificationBar(`Release ${rowData.releaseNumber} has been set to ${!rowData.closed}`, "notification_important", "normal");
        this.getAllRelease();
      })
    }

  }

  addEnvironment() {
    if (this.selectedEnvironmentNo != undefined) {
      let environmentInfo = new Environment();
      environmentInfo.executionEnvName = this.selectedEnvironmentNo;
      environmentInfo.createdBy = this.userProfileDetail.userName;
      environmentInfo.modifiedBy = this.userProfileDetail.userName;
      environmentInfo.clientOrganization = this.organization;

      this.environmentService.addNewEnvironment(environmentInfo).subscribe(result => {
        this.openNotificationBar(`Environment ${this.selectedEnvironmentNo} has been added`, "notification_important", "normal");
        this.getAllEnvInfo();
      })
    }
    else {
      this.openNotificationBar("Please enter Environment first", "error", "normal");
    }
  }

  getAllRelease(): void {
    this.releaseMappingService.getAllReleaseInfo(this.clientProjectId, "all").subscribe(result => {
      this.releaseAllArr = new MatTableDataSource(result);
      this.releaseAllArr.paginator = this.paginatorRelease;
      this.releaseAllArr.sort = this.sortRelease;
    });

  }

  applyFilterRelease(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.releaseAllArr.filter = filterValue;
    if (this.releaseAllArr.paginator) {
      this.releaseAllArr.paginator.firstPage();
    }
  }

  getAllEnvInfo() {
    this.environmentService.getAllEnvironmentInfo()
      .subscribe(
        result => {
          this.environmentInfoArr = new MatTableDataSource(result);
          this.environmentInfoArr.paginator = this.paginatorEnv;
          this.environmentInfoArr.sort = this.sortEnv;
        });
  }

  applyFilterEnv(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.environmentInfoArr.filter = filterValue;
    if (this.environmentInfoArr.paginator) {
      this.environmentInfoArr.paginator.firstPage();
    }
  }

  openNotificationBar(message: string, type: string, action: string) {

    let dialogRef = this.dialog.open(NotificationComponent, {
      data: {
        notificaitonDataReceived: message,
        notificaitonTypeReceived: type,
        notificaitonActionReceived: action,
      },
      panelClass: 'notificaiton-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
    });

  }

}
