import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import introJs from 'intro.js';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { EnterLeave, EnterLeaveTop, fadeInOut } from '../../internalApp/animations';
import { AttachBugComponent } from '../attach-bug/attach-bug.component';
import { ClientProject } from '../client-project';
import { ClientProjectService } from '../client-project.service';
import { LoginService } from '../login.service';
import { Module } from '../module';
import { ModuleService } from '../module.service';
import { ShowTestCaseComponent } from '../show-test-case/show-test-case.component';
import { TestExecutionImportComponent } from '../test-execution-import/test-execution-import.component';
import { TestCaseDefinition } from '../testcase-definition';
import { TestcaseDefinitionAddDialogComponent } from '../testcase-definition-add-dialog/testcase-definition-add-dialog.component';
import { TestcaseDefinitionDetailDialogComponent } from '../testcase-definition-detail-dialog/testcase-definition-detail-dialog.component';
import { TestcaseDefinitionImportDialogComponent } from '../testcase-definition-import-dialog/testcase-definition-import-dialog.component';
import { TestcaseDefinitionService } from '../testcase-definition.service';
import { TestcaseExecutionAddDialogComponent } from '../testcase-execution-add-dialog/testcase-execution-add-dialog.component';
import { TestCaseDataSource } from '../testdefination-datasource';
import { VersionPopupComponent } from '../version-popup/version-popup.component';
import { BugInfoBoxComponent } from '../bug-info-box/bug-info-box.component';

@Component({
  selector: 'app-testcase-definition',
  templateUrl: './testcase-definition.component.html',
  styleUrls: ['./testcase-definition.component.css'],
  animations: [
    fadeInOut,
    EnterLeave,
    EnterLeaveTop
  ]
})
export class TestcaseDefinitionComponent implements OnInit {

  testCaseDefinitions: MatTableDataSource<TestCaseDefinition>;
  displayedColumns: string[] = ['testCaseNo', 'ModuleName', 'testSummary', 'createdDate', 'tags', 'createdBy'];

  tcDefaultColumns: string[] = ['testCaseNo', 'ModuleName', 'testSummary', 'createdDate', 'tags', 'createdBy'];
  tcAllColumns =
    [{
      name: 'testCaseNo', value: 'Test Case ID'
    },
    {
      name: 'ModuleName', value: 'Module Name'
    }, {
      name: 'testSummary', value: 'Test Case Summary'
    }, {
      name: 'createdDate', value: 'Creation Date'
    }, {
      name: 'tags', value: 'Tags'
    }, {
      name: 'createdBy', value: 'Created By'
    }, {
      name: 'executionSteps', value: 'Execution Steps'
    }, {
      name: 'preCondition', value: 'Pre Condition'
    }, {
      name: 'expectedResult', value: 'Expected Result'
    }];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('input') input: ElementRef;

  allModuleArr: Module[] = [];
  moduleHierarchyArr: Module[] = [];
  // organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  organization: string = this.loginService.getUserInformationFromLocalStorage().defaultOrganization;
  clientProjects: ClientProject[] = [];
  clientProjectId: number;
  isLoaded = false;
  selectedHeaderName = 'Test Case No.';

  intro = introJs();
  paramintroJs = '';
  tourButtonInterval: any;
  tourEnd = false;

  totalTestCaseCountUI: number[];

  applicableFlag = "all"

  constructor(
    private testcaseDefinitionService: TestcaseDefinitionService,
    public dialog: MatDialog,
    private clientProjectService: ClientProjectService,
    private loginService: LoginService,
    private moduleService: ModuleService, private activatedRoute: ActivatedRoute, public router: Router
  ) { }

  ngOnInit() {
    this.getProjectsByOrganizationName(this.organization);
    this.dataSource = new TestCaseDataSource(this.testcaseDefinitionService);

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
    let currentTourEnd = this.tourEnd;

    this.intro.setOptions({
      steps: [
        {
          element: '#introProjectTitle',
          intro: 'Select a Project to work with',
          position: 'left',
          tooltipclass: 'forLastStep'
        },
        {
          element: '#introAddDefinitonTitle',
          intro: 'Manually create a New Test Case by clicking on the Button and fill all he required information',
          position: 'right'
        },
        {
          element: '#introImportDefinitionTitle',
          intro: ' Import Test Cases in bulk using a CSV or import Automation feature file by clicking the Button.',
          position: 'right'
        },
        {
          element: '#introImportExecutionTitle',
          intro: ' Import Test Results in bulk using a CSV, JSON or XML by clicking on the Button.',
          position: 'right'
        },
        {
          element: '#introDefinitionTableTitle',
          intro: 'View the Test Cases for the selected project. Quick Edit and update Execution results can be done from this view',
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
    this.intro.setOption('doneLabel', 'Next page').start().onexit(function () {
      if (!currentTourEnd) {
        currentRouter.navigate(['/app/testCaseDefinition']);
      }
    }).oncomplete(function () {
      currentTourEnd = true;
      currentRouter.navigate(['/dashBoard'], { queryParams: { appWalkthroughIntro: 'AutomationMapping' } });
    });

  }

  ngOnDestroy() {
    this.intro.exit();
  }

  editTestCaseDefinition(row) {
    const dialogRef = this.dialog.open(TestcaseDefinitionDetailDialogComponent, {
      width: '800px',
      data: {
        row, modifiedBy: this.loginService.getUserInformationFromLocalStorage().userName,
        clientProject: this.clientProjectId,
        clientOrg: this.organization
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Ok') { this.loadDynamicData(this.clientProjectId); }
    });
  }

  showTestCaseDefinition(row) {
    const dialogRef = this.dialog.open(ShowTestCaseComponent, {
      width: '800px',
      data: {
        row, modifiedBy: this.loginService.getUserInformationFromLocalStorage().userName,
        clientProject: this.clientProjectId,
        clientOrg: this.organization
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Ok') { this.loadDynamicData(this.clientProjectId); }
    });
  }

  showAttachedBugInfo(testCaseId: number) {
    const dialogRef = this.dialog.open(BugInfoBoxComponent, {
      width: '80%',
      height: '75%',
      data: {
        testCaseId,
        modifiedBy: this.loginService.getUserInformationFromLocalStorage().userName,
        clientProject: this.clientProjectId,
        clientOrg: this.organization
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // if (result == 'Ok') { this.loadDynamicData(this.clientProjectId); }
    });
  }

  addTestCaseDefinition() {
    const dialogRef = this.dialog.open(TestcaseDefinitionAddDialogComponent, {
      width: '700px',
      data: {
        createdBy: this.loginService.getUserInformationFromLocalStorage().userName,
        clientProject: this.clientProjectId,
        clientOrg: this.organization
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Ok') { this.loadDynamicData(this.clientProjectId); }
    });
  }

  importTestCaseDefinition() {
    const dialogRef = this.dialog.open(TestcaseDefinitionImportDialogComponent, {
      width: '40%',
      height: '60%',
      data: {
        clientProject: this.clientProjectId,
        clientOrg: this.organization
      },
      disableClose: true

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != 'cancel') {
        this.loadDynamicData(this.clientProjectId);
      }
    });
  }

  addTestCaseExecution(row) {
    const dialogRef = this.dialog.open(TestcaseExecutionAddDialogComponent, {
      width: '800px',
      data: { row, selectedOrg: this.organization, clientProject: this.clientProjectId },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      this.loadDynamicData(this.clientProjectId);
    });
  }

  fetchOlderVersions(row) {
    const dialogRef = this.dialog.open(VersionPopupComponent, {
      width: '60%',
      height: '90%',
      data: { row, selectedOrg: this.organization, clientProject: this.clientProjectId },
      panelClass: 'version-testcase-box'
      // disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      // this.loadDynamicData(this.clientProjectId);
    });
  }

  attachBug(row: any) {
    const dialogRef = this.dialog.open(AttachBugComponent, {
      width: '52%',
      height: '68%',
      data: { row, selectedOrg: this.organization, clientProject: this.clientProjectId },
      panelClass: 'version-testcase-box'
      // disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Ok') { this.loadDynamicData(this.clientProjectId); }
    });
  }

  getProjectsByOrganizationName(organization: string) {
    this.organization = organization;
    this.clientProjectService.getClientProjects()
      .subscribe(
        result => {
          this.clientProjects = result;
          if (this.clientProjects.length === 0) {
            this.clientProjectId = 0;
          } else {
            this.clientProjectId = this.clientProjects[0].clientProjectId;
          }
          this.loadDynamicData(this.clientProjectId);
        });
    // this.getTestCaseDefinitions(this.clientProjectId);
  }

  getTestCaseDefinitions(clientProjectId: number): void {
    this.clientProjectId = clientProjectId;
    const allProjectTempId = clientProjectId === undefined ? 0 : clientProjectId;
    // this.isLoaded = true;
    // this.testcaseDefinitionService.getTestCaseDefinitions(this.organization, allProjectTempId, "all", null, null, null, 0, 0)
    //   .subscribe(
    //     testCaseDefinitions => {
    //       testCaseDefinitions.forEach(function (part, index, theArray) {
    //         part.modulesNameHierarchy = part.modulesNameHierarchy.replace(/@#/g, '\n⇓\n');
    //         part.modulesNameHierarchy = part.modulesNameHierarchy.replace(/\\"/g, '"');
    //         theArray[index].modulesNameHierarchy = part.modulesNameHierarchy;
    //       });
    //       this.testCaseDefinitions = new MatTableDataSource(testCaseDefinitions);
    //       this.testCaseDefinitions.paginator = this.paginator;
    //       this.testCaseDefinitions.sort = this.sort;
    //       this.isLoaded = false;
    //     });
  }

  importTestCaseExecution() {
    const dialogRef = this.dialog.open(TestExecutionImportComponent, {
      width: '40%',
      height: '80%',
      data: {
        clientProject: this.clientProjectId,
        clientOrg: this.organization
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      // this.getTestCaseDefinitions(this.clientProjectId);
    });
  }

  dataSource: TestCaseDataSource;

  ngAfterViewInit() {

    // server-side search
    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.loadDynamicData(this.clientProjectId);
        })
      )
      .subscribe();

    // reset the paginator after sorting
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    // on sort or paginate events, load a new page
    merge(this.paginator.page)
      .pipe(
        tap(() =>
          this.loadDynamicData(this.clientProjectId)
        )
      )
      .subscribe();
  }

  loadDynamicData(clientProjectId: number) {
    this.isLoaded = true;
    this.clientProjectId = clientProjectId;
    const allProjectTempId = clientProjectId === undefined ? 0 : clientProjectId;
    this.dataSource.loadCases(
      this.organization, allProjectTempId, this.applicableFlag,
      this.selectedHeaderName,
      this.input.nativeElement.value,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize);
    this.getTestCaseCount();
    this.isLoaded = false;
  }

  getTestCaseCount() {
    if (this.clientProjectId != undefined) {
      this.testcaseDefinitionService.getTestCaseCount(this.clientProjectId, this.applicableFlag, this.input.nativeElement.value)
        .subscribe(
          count => {
            this.totalTestCaseCountUI = count;
          });
    }
  }

  setTableHeader(headerName) {
    this.selectedHeaderName = headerName;
    this.loadDynamicData(this.clientProjectId);
  }


  // Context Menu Code Start #####################
  contextmenu = false;
  contextmenuX = 0;
  contextmenuY = 0;
  currentRow: any;

  //activates the menu with the coordinates
  onrightClick(event, row: any) {
    this.contextmenuX = event.pageX
    this.contextmenuY = event.pageY
    this.contextmenu = true;
    this.currentRow = row;
  }
  //disables the menu
  disableContextMenu() {
    this.contextmenu = false;
  }
  // Context Menu Code End ####################

  checkTcProdBug(testCase: TestCaseDefinition): boolean {
    if (testCase.bugsAndTypes != null && testCase.bugsAndTypes != "") {
      return testCase.productionBug;
    } else {
      return false;
    }
  }

  checkTcOtherBug(testCase: TestCaseDefinition): boolean {
    if (testCase.bugsAndTypes != null && testCase.bugsAndTypes != "") {
      return !testCase.productionBug;
    } else {
      return false;
    }
  }

  getAllAssignedBugs(testCase: TestCaseDefinition): string {
    if (testCase.bugsAndTypes != null && testCase.bugsAndTypes != "") {
      let bugsAndTypes = testCase.bugsAndTypes.split(',');
      let bugs = "Tickets: ";
      bugsAndTypes.forEach(bug => {
        bugs += bug.substr(0, bug.indexOf("::"));
        bugs += ", "
      });
      return bugs.replace(/,\s*$/, "");
    } else {
      return "";
    }
  }

  selectTcTableColumns() {
    this.displayedColumns = this.tcDefaultColumns;
  }

}
