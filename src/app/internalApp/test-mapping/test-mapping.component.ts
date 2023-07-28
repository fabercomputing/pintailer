import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSelectionList } from '@angular/material';
import { TestMappingService } from "../test-mapping.service";
import { TestcaseDefinitionService } from "../testcase-definition.service";
import { ModuleService } from '../module.service'
import { FeatureFile } from "../feature-scenario";
import { ScenarioFile } from "../feature-scenario";
import { FeatureScenario } from "../feature-scenario";
import { Module } from '../module';
import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { TestCaseDefinition } from '../testcase-definition';
import { MatPaginator, MatSort } from '@angular/material';
import { TestStep } from "../testStep";
import { TestMap } from "../testMap";
import { UserProfileDetail } from '../user'
import { LoginService } from "../login.service"
import { CommonService } from '../common.service'
import { selectAll, select } from "d3";
import { ClientProjectService } from '../client-project.service'
import { ClientProject } from '../client-project'
import { ExistingMappingComponent } from '../existing-mapping/existing-mapping.component'
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import introJs from 'intro.js';
import { Router } from '@angular/router';
import { ModuleSelectionComponent } from '../module-selection/module-selection.component';
import { Release } from '../release';
import { ReleaseMappingService } from '../release-mapping.service';
import { ScenarioEdit, TestStepEdit, MappedScenarioInfo } from "../feature-scenario";

@Component({
  selector: 'app-test-mapping',
  templateUrl: './test-mapping.component.html',
  styleUrls: ['./test-mapping.component.css']
})
export class TestMappingComponent implements OnInit {


  displayedColumns: string[] = ['select', 'testCaseNo', 'testSummary', 'mappingInfo', 'versions'];
  dataSource: MatTableDataSource<TestCaseDefinition>;
  selection = new SelectionModel<TestCaseDefinition>(false, []);
  displayedColumnsSecond: string[] = ['select', 'name'];
  dataSourceSecond: MatTableDataSource<TestStepEdit>;
  selectionSecond = new SelectionModel<TestStepEdit>(true, []);

  // organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  organization: string = this.loginService.getUserInformationFromLocalStorage().defaultOrganization;
  clientProjects: ClientProject[] = [];
  clientProjectId: number;
  userProfileDetail: UserProfileDetail;
  featureFile: FeatureFile[] = [];
  scenariosOfFeature: ScenarioFile[] = [];
  moduleHierarchyArr: Module[] = [];
  // moduleHierarchyArr2: Module[] = [];
  selectedFeature: string;
  selectedScenario: ScenarioFile;
  selectedModule: number;
  // selectedScenarioID: number;
  selectedtestCaseId: number;
  selectedtestStepId: number;
  panelOpenState: boolean = false;
  dataLoading = false;

  testCaseArr: TestCaseDefinition[] = [];
  testScenarioStepArr: ScenarioEdit[] = [];
  previouslySelectedStepsArr: TestMap[] = [];

  @ViewChild("paginatorOne") paginatorOne: MatPaginator;
  @ViewChild("sortOne") sortOne: MatSort;

  @ViewChild("paginatorSecond") paginatorSecond: MatPaginator;
  @ViewChild("sortSecond") sortSecond: MatSort;

  @ViewChild('manualID') featureSelection: MatSelectionList;
  @ViewChild('autoID') scenarioSelection: MatSelectionList;

  intro = introJs();
  paramintroJs: string = "";
  tourButtonInterval: any;

  selectedRelease = 0;
  releaseAllArr: Release[] = [];

  scenarioStepVersions: number[] = [];
  selectedScenarioStepVersions = 0;

  // scenarioStepMappingId = 0;
  scenarioStepMappingIdList: number[] = [];
  selectedTestCaseVersion: string;

  mappedScenarioInfo: MappedScenarioInfo;

  selectedTestCase: TestCaseDefinition;

  toggleMappedBool = false;
  toggleMappedDisabled = false;

  constructor(
    private releaseMappingService: ReleaseMappingService,
    private commonService: CommonService, private clientProjectService: ClientProjectService,
    private testMappingService: TestMappingService, private testcaseDefinitionService: TestcaseDefinitionService,
    private moduleService: ModuleService, private loginService: LoginService,
    private dialog: MatDialog, private activatedRoute: ActivatedRoute, public router: Router) { }

  ngOnInit() {
    this.getProjectsByOrganizationName(this.organization);
    setInterval(this.beutifyAllScenarioSteps, 3500);
    // this.tourButtonInterval = setInterval(this.tourButtonTimer, 15000);
    if (this.activatedRoute.snapshot.queryParamMap.get('appWalkthroughIntro') != null) {
      this.paramintroJs = this.activatedRoute.snapshot.queryParamMap.get('appWalkthroughIntro');
    }

    if (this.paramintroJs === "true") {
      this.tourButtonInterval = setTimeout(this.startTour.bind(this), 1000);
    }

  }

  startTour() {

    let currentRouter = this.router;
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
          element: '#introModuleTitle',
          intro: 'Select a Module from the hierarchy to fetch the required test cases',
          position: 'right'
        },
        {
          element: '#introFeatureSelectTitle',
          intro: 'Select a Feature File to fetch the Automated test scenarios',
          position: 'right'
        },
        {
          element: '#introScenarioSelectTitle',
          intro: 'Select a scenario to fetch the Automated test steps',
          position: 'right'
        },
        {
          element: '#introTestCaseTitle',
          intro: 'From this table select the Test Case for which the automation mapping needs to be done',
          position: 'right'
        },
        {
          element: '#introTestStepTitle',
          intro: 'From this table select the Test Steps to which the Test case needs to be mapped',
          position: 'right'
        },
        {
          element: '#introMapTestCaseTitle',
          intro: 'Click on the button to save the Mapping information',
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
      currentRouter.navigate(['/dashBoard'], { queryParams: { appWalkthroughIntro: "ReleaseMapping" } });
    }).onexit(function () {
      if (!currentTourEnd) {
        currentRouter.navigate(['/app/testCaseMapping']);
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
            this.getAllRelease();
            this.getModuleHierarchyByProjectName(this.clientProjectId);
          } else {
            // this.getAllRelease();
          }
        });
    // this.getModuleHierarchy(this.organization, 0);
    // this.getAllFeature(this.organization, 0);
  }

  getModuleHierarchyByProjectName(clientProjectId: number): void {

    this.dataLoading = true;
    let allProjectTempId = 0;
    if (clientProjectId === undefined) {
      allProjectTempId = 0;
    } else {
      allProjectTempId = clientProjectId
    }
    // this.moduleHierarchyArr2.length = 0;
    // this.moduleService.getModulesTree(allProjectTempId).subscribe(result => {
    //   this.moduleHierarchyArr2 = result;
    //   this.dataLoading = false;
    // })
    // this.getModuleHierarchy(allProjectTempId);
    this.getAllFeature(this.organization, allProjectTempId);
    this.selection.clear()
    this.selectionSecond.clear()
    this.selectedtestCaseId = 0;
    this.scenariosOfFeature = null;
    this.dataSourceSecond = null;
    this.selectedScenario = null;
    this.dataSource = null;
    this.selectedModuleName = "No Module Selected";
    this.selectedModule = undefined;
    this.scenarioStepVersions.length = 0;
    this.scenarioStepMappingIdList.length = 0;
  }

  getModuleHierarchy(organization, clientProjectId): void {
    this.moduleService.getModuleHierarchy(clientProjectId).subscribe(result => {
      this.moduleHierarchyArr = result;
    });
  }

  getAllFeature(organization, clientProjectId): void {
    this.dataLoading = true;
    this.testMappingService.getAllFeatureFiles(clientProjectId)
      .subscribe(result => {
        this.featureFile = result;
        this.dataLoading = false;
      });
  }

  /**
   * Fetch Scenarios
   */
  getScenariosOf(toSelectScenario: string): void {
    this.dataLoading = true;
    this.selection.clear()
    this.selectionSecond.clear()
    this.selectedtestCaseId = 0;
    this.scenariosOfFeature = null;
    this.scenarioStepVersions.length = 0;
    this.scenarioStepMappingIdList.length = 0;
    this.testMappingService.getScenariosOfFeature(this.selectedFeature, this.organization, this.clientProjectId).subscribe(result => {
      this.scenariosOfFeature = result;
      this.selectedScenarioStepVersions = 0;
      this.dataSourceSecond = null;
      if (toSelectScenario != "0") {
        // this.selectedScenario = toSelectScenario;
        this.scenariosOfFeature.forEach(scenario => {
          if (scenario.testScenarioId == this.selectedScenario.testScenarioId) {
            // this.selectedScenarioVersions = this.selectedScenario.scenarioSelectedVersion;
            this.selectedScenario = scenario;
            this.getTestSteps(scenario);
          }
        });

      } else {
        this.selectedScenario = null;
      }
      this.dataLoading = false;
    });
  }

  getTestSteps(scenarioFile: ScenarioFile): void {
    this.dataLoading = true;
    var event = document.createEvent("HTMLEvents");
    event.initEvent("click", true, true);
    var button = document.querySelectorAll('.mat-paginator-navigation-first')[1];
    button.dispatchEvent(event);

    this.selection.clear()
    this.selectionSecond.clear()
    this.selectedtestCaseId = 0;
    // this.selectedScenarioID = +scenarioFile.testScenarioId;

    // if (this.selectedScenarioVersions != "") {
    //   scenarioFile.scenarioSelectedVersion = this.selectedScenarioVersions;
    // }

    // if (scenarioFile.existingVersions.includes(",")) {
    //   this.scenarioVersions = scenarioFile.existingVersions.split(',');
    // } else {
    //   this.scenarioVersions.length = 0;
    // }

    this.testMappingService.getTestStepsService(scenarioFile).subscribe(result => {
      this.scenarioStepMappingIdList.length = 0;
      this.testScenarioStepArr.length = 0;
      this.scenarioStepVersions.length = 0;

      for (var prop in result) {
        // this.scenarioStepMappingId = parseInt(prop);
        this.scenarioStepMappingIdList.push(parseInt(prop));
        this.testScenarioStepArr.push(result[prop]);
      }

      this.testScenarioStepArr.forEach((scenarioStep, index) => {
        this.scenarioStepVersions.push(index + 1);
        this.selectedScenarioStepVersions = this.testScenarioStepArr.length;
        scenarioStep.testStepsList.forEach((item, indexStep) => {
          item.name = item.name.replace('And ', '<span class="specialChar">And </span>');
          item.name = item.name.replace('When ', '<span class="specialChar">When </span>');
          item.name = item.name.replace('Then', '<span class="specialChar">Then </span>');
          item.name = item.name.replace('But ', '<span class="specialChar">But </span>');
          item.name = item.name.replace('Given ', '<span class="specialChar">Given </span>');
        });
      });

      if (this.mappedScenarioInfo != undefined && (this.selectedRelease != 0)) {
        if (this.mappedScenarioInfo.testScenarioStepVersionId != 0) {
          this.scenarioStepMappingIdList.forEach((id, index) => {
            if (id === this.mappedScenarioInfo.testScenarioStepVersionId) {
              this.selectedScenarioStepVersions = index + 1;
            }
          });
        }
      }

      this.dataSourceSecond = new MatTableDataSource(this.testScenarioStepArr[this.selectedScenarioStepVersions - 1].testStepsList);
      this.dataSourceSecond.paginator = this.paginatorSecond;
      this.dataSourceSecond.sort = this.sortSecond;
      setTimeout(this.beutifyAllScenarioSteps, 1000);
      this.dataLoading = false;

      if (this.dataSource != null) {
        this.dataSource.data.forEach((item, index) => {
          if (item.testCaseSequenceId === this.selectedTestCase.testCaseSequenceId) {
            this.selection.select(item);
          }
        });
        this.mapPreviousSteps();
      }
    });

  }

  selectScenarioStepVersion() {
    this.selection.clear()
    this.selectionSecond.clear()
    this.selectedtestCaseId = 0;
    this.dataSourceSecond = new MatTableDataSource(this.testScenarioStepArr[this.selectedScenarioStepVersions - 1].testStepsList);
    this.dataSourceSecond.paginator = this.paginatorSecond;
    this.dataSourceSecond.sort = this.sortSecond;
  }


  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelectedSecond() {
    const numSelectedSecond = this.selectionSecond.selected.length;
    const numRows = this.dataSourceSecond.data.length;
    return numSelectedSecond === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggleSecond() {
    this.isAllSelectedSecond() ?
      this.selectionSecond.clear() :
      this.dataSourceSecond.data.forEach(row => this.selectionSecond.select(row));
  }

  applyFilterSecond(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourceSecond.filter = filterValue;
    if (this.dataSourceSecond.paginator) {
      this.dataSourceSecond.paginator.firstPage();
    }
  }

  getTestCaseByModule(): void {
    if (this.selectedModule != undefined) {
      this.selection.clear();
      this.selectionSecond.clear();
      this.dataLoading = true;
      this.testCaseArr = null;
      this.testcaseDefinitionService.getTestCaseForModule(this.clientProjectId, this.selectedRelease, this.selectedModule).subscribe(testcaseDefinitionService => {
        if (testcaseDefinitionService.length === 0) {
          this.commonService.openNotificationBar("No test cases available for selected module", "warning", "normal");
        }
        this.testCaseArr = testcaseDefinitionService;
        this.dataSource = new MatTableDataSource(testcaseDefinitionService);
        this.dataSource.paginator = this.paginatorOne;
        this.dataSource.sort = this.sortOne;
        this.dataLoading = false;
      });
    }
  }

  noReleaseSelectionCase() {
    if (this.selectedRelease === 0) {
      if (this.scenarioStepVersions.length > 0) {
        this.selectedScenarioStepVersions = this.scenarioStepVersions[this.scenarioStepVersions.length - 1];
        this.selectScenarioStepVersion();
      }
    }
  }

  mapTestCases(): void {
    this.dataLoading = true;
    if (this.selectedtestCaseId != 0) {
      this.userProfileDetail = this.loginService.getUserInformationFromLocalStorage();
      // delete all previously mapped steps and then map steps
      let selectedTestStepIds = "";
      this.testMappingService.deleteAllMappedSteps(this.clientProjectId, this.selectedRelease, this.selectedtestCaseId, this.selectedScenario.testScenarioId).subscribe(result => {

        this.dataSourceSecond.data.forEach((item, index) => {
          if (this.selectionSecond.isSelected(item)) {
            selectedTestStepIds += item.testStepId + "::" + item.stepSelectedVersion + ",";
          }
        });

        if (selectedTestStepIds != "") {
          this.testMappingService.mapTestCaseToStep(this.clientProjectId, this.selectedRelease, this.selectedtestCaseId, this.selectedTestCaseVersion, selectedTestStepIds, this.selectedScenario.testScenarioId, this.scenarioStepMappingIdList[this.selectedScenarioStepVersions - 1]).subscribe(result => {
          });
        } else {
          this.testMappingService.mapTestCaseToStep(this.clientProjectId, this.selectedRelease, this.selectedtestCaseId, this.selectedTestCaseVersion, null, this.selectedScenario.testScenarioId, this.scenarioStepMappingIdList[this.selectedScenarioStepVersions - 1]).subscribe(result => {
          });
        }

        this.dataLoading = false;
        this.commonService.openNotificationBar("Selected Test Case has been mapped", "notification_important", "normal");
      });

    }
    else {
      this.dataLoading = false;
      this.commonService.openNotificationBar("Please select a Test Case first", "error", "normal");
    }
  }

  mapPreviousSteps(): void {
    this.selectionSecond.clear()
    var flag = true;
    this.dataSource.data.forEach((item, index) => {

      if (this.selection.isSelected(item)) {
        flag = false
        this.selectedtestCaseId = item.testCaseSequenceId;
        this.selectedTestCaseVersion = item.selectedVersion;
        this.previouslySelectedStepsArr = null;
        this.testMappingService.getPreviouslySelectedSteps(this.clientProjectId, this.selectedRelease, this.selectedtestCaseId, this.selectedTestCaseVersion).subscribe(result => {
          this.previouslySelectedStepsArr = result;
          this.previouslySelectedStepsArr.forEach((item, index) => {
            this.pullPreviouslySelectedSteps(item);
          });
        });
      }
      if (flag) {
        this.selectedtestCaseId = 0;
        this.selectedTestCaseVersion = "";
      }
    });
  }

  pullPreviouslySelectedSteps(testMap: TestMap): void {
    if (this.dataSourceSecond != null) {
      this.dataSourceSecond.data.forEach((item, index) => {
        // console.log("::::::::::: " + this.scenarioStepMappingIdList[this.selectedScenarioStepVersions - 1] + " ----- " + testMap.testScenarioStepVersionId)
        if (this.scenarioStepMappingIdList[this.selectedScenarioStepVersions - 1] === testMap.testScenarioStepVersionId || (this.selectedRelease === 0)) {
          if (item.testStepId === testMap.testStepId) {
            this.selectionSecond.select(item);
          }
        }
      });
    }
  }

  beutifyAllScenarioSteps(): void {
    selectAll(".specialChar").each(function (d: any) {
      select(this).style("background", "linear-gradient(to bottom, #ff9900 0%, #800000 100%)")
        .style("-webkit-background-clip", "text").style("-webkit-text-fill-color", "transparent")
        .style("font-size", "medium").style("font", "bold").style("font-family", "\"Comic Sans MS\", cursive, sans-serif");
    })
  }

  selectedModuleName = "No Module Selected";

  selectModuleName(moduleId: number, nameModule: string) {
    this.selectedModuleName = "Selected Module: " + nameModule;
    this.selectedModule = moduleId;
  }

  togglePanel() {
    this.panelOpenState = !this.panelOpenState;
  }

  showTestCaseMappingInfo(testCase: TestCaseDefinition) {
    this.selectedTestCase = testCase;
    let dialogRef = this.dialog.open(ExistingMappingComponent, {
      width: '700px',
      data: {
        createdBy: this.loginService.getUserInformationFromLocalStorage().userName,
        clientOrganization: this.organization,
        selectedProject: this.clientProjectId,
        testCaseId: testCase.testCaseSequenceId,
        selectedRelease: this.selectedRelease,
        selectedTestCaseVersion: testCase.selectedVersion
      }

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {

        this.selectedFeature = result.testScenarios.featureFileName;
        // this.selectedScenarioID = result.testScenarioId;
        this.selectedScenario = result.testScenarios;
        this.mappedScenarioInfo = result;

        this.getScenariosOf("1");
      }
    });
  }

  openModuleSelection() {
    this.openModuleSelectionPopup("test", this.clientProjectId);
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
        this.getTestCaseByModule();
      }
    });

  }

  getAllRelease(): void {
    this.releaseMappingService.getAllReleaseInfo(this.clientProjectId, "true").subscribe(result => {
      this.releaseAllArr = result;
      if (this.releaseAllArr.length > 0) {
        this.selectedRelease = 0;
        // this.pullPreviouslyMappedRelease();
      }
    });

  }

  toggleMapped() {
    
    if (this.toggleMappedBool === false) {
      this.dataSourceSecond.data.forEach((itemData, index) => {
        if (this.selectionSecond.isSelected(itemData)) {
          itemData.checkedStep = "";
        }
      });

      this.dataSourceSecond.filter = "";
      if (this.dataSourceSecond.paginator) {
        this.dataSourceSecond.paginator.firstPage();
      }
    }
    else {
      this.dataSourceSecond.data.forEach((itemData, index) => {
        if (this.selectionSecond.isSelected(itemData)) {
          itemData.checkedStep = "Selection is Mapped";
        }
      });

      this.dataSourceSecond.filter = "Selection is Mapped";
      if (this.dataSourceSecond.paginator) {
        this.dataSourceSecond.paginator.firstPage();
      }
    }
  }

}