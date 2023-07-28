import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import introJs from 'intro.js';
import { ClientProject } from '../client-project';
import { ClientProjectService } from '../client-project.service';
import { CommonService } from '../common.service';
import { LoginService } from '../login.service';
import { Module } from '../module';
import { ModuleService } from '../module.service';
import { Release, ReleaseMap } from '../release';
import { ReleaseMappingService } from '../release-mapping.service';
import { TestCaseDefinition } from '../testcase-definition';
import { TestcaseDefinitionService } from '../testcase-definition.service';
import { UserProfileDetail } from '../user';
import { MatDialog } from '@angular/material';
import { ModuleSelectionComponent } from '../module-selection/module-selection.component';
import { VersionPopupComponent } from '../version-popup/version-popup.component';

@Component({
  selector: 'app-release-mapping',
  templateUrl: './release-mapping.component.html',
  styleUrls: ['./release-mapping.component.css']
})
export class ReleaseMappingComponent implements OnInit {

  intro = introJs();
  paramintroJs = '';
  tourButtonInterval: any;

  constructor(private dialog: MatDialog, private commonService: CommonService, private clientProjectService: ClientProjectService,
    private moduleService: ModuleService, private loginService: LoginService, private testcaseDefinitionService: TestcaseDefinitionService,
    private releaseMappingService: ReleaseMappingService, private activatedRoute: ActivatedRoute, public router: Router) { }

  displayedColumns: string[] = ['select', 'testCaseNo', 'ModuleName', 'testSummary', 'versions'];
  dataSource: MatTableDataSource<TestCaseDefinition>;
  selection = new SelectionModel<TestCaseDefinition>(true, []);

  // organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  organization: string = this.loginService.getUserInformationFromLocalStorage().defaultOrganization;
  clientProjects: ClientProject[] = [];
  clientProjectId: number;
  moduleHierarchyArr: Module[] = [];
  selectedModule = 0;
  testCaseArr: TestCaseDefinition[] = [];
  moduleHierarchyArrAll: Module[] = [];
  releaseAllArr: Release[] = [];
  releaseMapArr: ReleaseMap[] = [];
  selectedReleaseNo: string;

  userProfileDetail: UserProfileDetail;
  selectedRelease = 0;
  previouslyMappedReleseArr: ReleaseMap[] = [];
  releaseCondition: string[] = ['All', 'Active', 'Inactive'];
  selectedConditionDropDown = 'All';
  selectedCondition = 'All';
  isLoaded = false;

  @ViewChild('paginatorOne') paginatorOne: MatPaginator;
  @ViewChild('sortOne') sortOne: MatSort;

  ngOnInit() {
    this.getProjectsByOrganizationName(this.organization);

    // this.tourButtonInterval = setInterval(this.tourButtonTimer, 15000);
    if (this.activatedRoute.snapshot.queryParamMap.get('appWalkthroughIntro') != null) {
      this.paramintroJs = this.activatedRoute.snapshot.queryParamMap.get('appWalkthroughIntro');
    }

    if (this.paramintroJs === 'true') {
      this.tourButtonInterval = setTimeout(this.startTour.bind(this), 1000);
    }

  }

  startTour() {

    const currentRouter = this.router;
    let currentTourEnd = false;

    this.intro.setOptions({
      steps: [
        {
          element: '#introProjectTitle',
          intro: 'Select a Project to work with',
          position: 'left',
          tooltipclass: 'forLastStep'
        },
        {
          element: '#introFilterModuleTitle',
          intro: 'Enable the Module hierarchy selection by clicking on the button',
          position: 'right'
        },
        {
          element: '#introReleaseCondTitle',
          intro: ' Select the release condition Active/Inactive/All from the dropdown',
          position: 'right'
        },
        {
          element: '#introReleaseSelectTitle',
          intro: 'Select a Release to which the Test Cases needs to be associated',
          position: 'right'
        },
        {
          element: '#introTestCaseTableTitle',
          intro: 'From the Table select all the required Test Cases',
          position: 'right'
        },
        {
          element: '#introMapReleaseTitle',
          intro: 'Click on the button to save the association information',
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
    this.intro.setOption('doneLabel', 'Next page').start().oncomplete(function () {
      currentTourEnd = true;
      currentRouter.navigate(['/dashBoard'], { queryParams: { appWalkthroughIntro: 'CoverageGraph' } });
    }).onexit(function () {
      if (!currentTourEnd) {
        currentRouter.navigate(['/app/releaseMapping']);
      }
    });

  }

  ngOnDestroy() {
    this.intro.exit();
  }

  getProjectsByOrganizationName(name: string) {
    this.organization = name;
    this.clientProjectService.getClientProjects()
      .subscribe(
        result => {
          this.clientProjects = result;
          if (this.clientProjects.length > 0) {
            this.clientProjectId = this.clientProjects[0].clientProjectId;
            // this.getTestCaseDefinitions(this.organization, this.clientProjectId);
            this.getAllRelease();
            this.getModuleHierarchyByProjectName(this.clientProjectId);
          } else {
            // this.getTestCaseDefinitions(this.organization, 0);
            this.getAllRelease();
          }
        });
    // this.getModuleHierarchy(this.organization, 0);

  }

  filterByModule: false;

  getModuleHierarchyByProjectName(clientProjectId: number): void {

    this.selectedModuleName = 'No Module Selected';
    let allProjectTempId = 0;
    if (clientProjectId === undefined) {
      allProjectTempId = 0;
    } else {
      allProjectTempId = clientProjectId;
    }
    if (this.filterByModule) {
      this.moduleService.getModulesTree(allProjectTempId).subscribe(result => {
        this.moduleHierarchyArr = result;
      });
    }
    // this.getTestCaseDefinitions(this.organization, allProjectTempId);

  }

  selectedModuleName = 'No Module Selected';

  selectModuleName(moduleId: number, nameModule: string) {
    this.selectedModuleName = "Selected Module: " + nameModule;
    this.selectedModule = moduleId;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    // console.log("######## " + this.isAllSelected());
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // getTestCaseByModule(): void {
  //   this.testCaseArr = null;
  //   this.selection.clear();
  //   this.testcaseDefinitionService.getTestCaseForModule(this.selectedModule).subscribe(testcaseDefinitionService => {

  //     testcaseDefinitionService.forEach(function (part, index, theArray) {
  //       part.modulesNameHierarchy = part.modulesNameHierarchy.replace(/@#/g, '\n⇓\n');
  //       part.modulesNameHierarchy = part.modulesNameHierarchy.replace(/\\"/g, '"');
  //       theArray[index].modulesNameHierarchy = part.modulesNameHierarchy;
  //     });

  //     this.testCaseArr = testcaseDefinitionService;
  //     this.dataSource = new MatTableDataSource(testcaseDefinitionService);
  //     this.dataSource.paginator = this.paginatorOne;
  //     this.dataSource.sort = this.sortOne;
  //   });
  // }

  getTestCaseDefinitions(organization: string, clientProjectId: number): void {
    this.isLoaded = true;
    this.selection.clear();
    this.testcaseDefinitionService.getTestCaseDefinitions(organization, clientProjectId, 'true', null, null, null, 0, 0)
      .subscribe(
        testCaseDefinitions => {

          testCaseDefinitions.forEach(function (part, index, theArray) {
            part.modulesNameHierarchy = part.modulesNameHierarchy.replace(/@#/g, '\n⇓\n');
            part.modulesNameHierarchy = part.modulesNameHierarchy.replace(/\\"/g, '"');
            theArray[index].modulesNameHierarchy = part.modulesNameHierarchy;

          });

          this.testCaseArr = testCaseDefinitions;
          this.dataSource = new MatTableDataSource(testCaseDefinitions);
          this.dataSource.paginator = this.paginatorOne;
          this.dataSource.sort = this.sortOne;

          if (this.selectedRelease != undefined) {
            if (this.selectedRelease > 0) {
              this.pullPreviouslyMappedRelease();

            } else {
              this.isLoaded = false;
            }
          } else {
            this.isLoaded = false;
          }

        });

  }

  // getModuleHierarchy(organization, clientProjectId): void {
  //   this.moduleService.getModuleHierarchy(organization, clientProjectId).subscribe(result => {
  //     this.moduleHierarchyArrAll = result;
  //     this.moduleHierarchyArrAll.forEach((item, index) => {
  //       item.hierarchy = item.hierarchy.replace(/[^a-zA-Z,,]/g, ' ');
  //       item.hierarchy = item.hierarchy.replace(/,/g, '\n⇑\n');
  //     });

  //   });
  // }

  getAllRelease(): void {
    if (this.selectedConditionDropDown === 'Active') {
      this.selectedCondition = 'true';
    } else if (this.selectedConditionDropDown === 'Inactive') {
      this.selectedCondition = 'false';
    } else {
      this.selectedCondition = 'all';
    }
    this.releaseMappingService.getAllReleaseInfo(this.clientProjectId, this.selectedCondition).subscribe(result => {
      this.releaseAllArr = result;
      if (this.releaseAllArr.length > 0) {
        this.selectedRelease = this.releaseAllArr[0].releaseId;
        this.pullPreviouslyMappedRelease();
      }
    });

  }

  mapRelease(): void {
    if (this.selectedRelease != 0) {
      // if (!this.selection.isEmpty()) {
      this.userProfileDetail = this.loginService.getUserInformationFromLocalStorage();
      // delete all previously mapped steps and then map steps
      if (this.selectedModule === undefined) {
        this.selectedModule = 0;
      }
      this.releaseMappingService.deleteAllMappedTestCases(this.clientProjectId, this.selectedRelease, this.selectedModule).subscribe(result => {
        const testReleaseMap = new ReleaseMap();
        testReleaseMap.releaseId = this.selectedRelease;
        testReleaseMap.createdBy = this.userProfileDetail.userName;
        testReleaseMap.modifiedBy = this.userProfileDetail.userName;
        testReleaseMap.testCaseIds = [];
        this.dataSource.data.forEach((item, index) => {
          if (this.selection.isSelected(item)) {
            let version = "";
            if (item.selectedVersion === null || item.selectedVersion === "V0") {
              version = "V1";
            } else {
              version = item.selectedVersion;
            }
            testReleaseMap.testCaseIds.push(item.testCaseSequenceId + "::" + version);
          }
        });
        if (!this.selection.isEmpty()) {
          this.releaseMappingService.mapTestCaseToRelease(this.clientProjectId, testReleaseMap).subscribe(result => {
            // TODO
            this.commonService.openNotificationBar('Selected Releases has been mapped', 'notification_important', 'normal');
            this.pullPreviouslyMappedRelease();
          });
        } else {
          this.pullPreviouslyMappedRelease();
        }
      });

      // }
      // else {
      //   this.openSnackBar("Please select a test case first", "Close");
      // }
    } else {
      this.commonService.openNotificationBar('Please select a release first', 'error', 'normal');
    }
  }

  // pullPreviouslyMappedRelease(releaseID: number): void {
  //   this.selection.clear();
  //   this.previouslyMappedReleseArr = null;
  //   this.releaseMappingService.getPreviouslySelectedCasesForRelease(releaseID, this.clientProjectId).subscribe(result => {
  //     this.previouslyMappedReleseArr = result;
  //     this.previouslyMappedReleseArr.forEach((mapRelease, indexR) => {
  //       this.dataSource.data.forEach((item, index) => {
  //         if (mapRelease.testCaseId === item.testCaseSequenceId) {
  //           this.selection.select(item);
  //         }
  //       });
  //     });
  //     this.isLoaded = false;
  //   });
  // }

  pullPreviouslyMappedRelease(): void {
    this.selection.clear();
    this.previouslyMappedReleseArr = null;

    this.isLoaded = true;

    this.releaseMappingService.getPreviouslySelectedCasesForRelease(this.selectedRelease, this.clientProjectId, this.selectedModule).subscribe(testCaseDefinitions => {

      testCaseDefinitions.forEach(function (part, index, theArray) {
        part.modulesNameHierarchy = part.modulesNameHierarchy.replace(/@#/g, '\n⇓\n');
        part.modulesNameHierarchy = part.modulesNameHierarchy.replace(/\\"/g, '"');
        theArray[index].modulesNameHierarchy = part.modulesNameHierarchy;
        part["previousMappping"] = part.selectedVersion;
      });

      this.testCaseArr = testCaseDefinitions;
      this.dataSource = new MatTableDataSource(testCaseDefinitions);
      this.dataSource.paginator = this.paginatorOne;
      this.dataSource.sort = this.sortOne;

      this.dataSource.data.forEach((item, index) => {
        if (item.mappedToRelease === true) {
          this.selection.select(item);
        }
      });

      // if (this.selectedRelease != undefined) {
      //   if (this.selectedRelease > 0) {
      //     this.pullPreviouslyMappedRelease(this.selectedRelease);

      //   } else {
      //     this.isLoaded = false;
      //   }
      // } else {
      //   this.isLoaded = false;
      // }

      // this.previouslyMappedReleseArr = testCaseDefinitions;
      // this.previouslyMappedReleseArr.forEach((mapRelease, indexR) => {
      //   this.dataSource.data.forEach((item, index) => {
      //     if (mapRelease.testCaseId === item.testCaseSequenceId) {
      //       this.selection.select(item);
      //     }
      //   });
      // });
      this.isLoaded = false;
    });
  }

  // addRelease() {
  //   this.userProfileDetail = this.loginService.getUserInformationFromLocalStorage();
  //   if (this.clientProjectId !== 0 && this.selectedReleaseNo != undefined) {
  //     const releaseInfo = new Release();
  //     releaseInfo.releaseNumber = this.selectedReleaseNo;
  //     releaseInfo.clientOrganization = this.organization;
  //     releaseInfo.createdBy = this.userProfileDetail.userName;
  //     releaseInfo.modifiedBy = this.userProfileDetail.userName;

  //     this.releaseMappingService.addNewRelease(releaseInfo).subscribe(result => {
  //       this.commonService.openNotificationBar('Release ' + this.selectedReleaseNo + ' has been added', 'notification_important', 'normal');
  //       this.getAllRelease();
  //     });
  //   } else {
  //     this.commonService.openNotificationBar('Please select a project and release number first', 'error', 'normal');
  //   }
  // }

  openModuleSelection() {
    this.openModuleSelectionPopup("all", this.clientProjectId);
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
        this.selectModuleName(result.nodeId, result.nodeName);
        if (result.nodeId != 0) {
          this.pullPreviouslyMappedRelease();
        } else {
          this.pullPreviouslyMappedRelease();
        }
      }
    });

  }


  fetchOlderVersions(row: TestCaseDefinition) {
    const dialogRef = this.dialog.open(VersionPopupComponent, {
      width: '60%',
      height: '90%',
      data: { row, selectedOrg: this.organization, clientProject: this.clientProjectId, selection: true },
      panelClass: 'version-testcase-box',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != "cancel") {
        row.selectedVersion = result.testCaseVersion;
        row.testCaseVersion = result.testCaseVersion;
        row.modulesNameHierarchy = result.modulesNameHierarchy;
        row.testSummary = result.testSummary;
      }
    });
  }

}