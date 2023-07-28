import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoginService } from "../login.service"
import { TestMappingService } from "../test-mapping.service";
import { TestMap } from "../testMap";
import { ScenarioFile } from '../feature-scenario';
import { TestStep } from '../testStep';
import { TestStepEdit, MappedScenarioInfo } from "../feature-scenario";

export class FeatureScenarioData {
  featureFileName: string;
  scenarioName: string;
  scenarioId: number;
}

@Component({
  selector: 'app-existing-mapping',
  templateUrl: './existing-mapping.component.html',
  styleUrls: ['./existing-mapping.component.css']
})
export class ExistingMappingComponent implements OnInit {

  description: string;
  organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  organization: string = this.organizations[0];
  mappedStepsInfo: TestMap[] = [];
  testScenarioIds: Set<number> = new Set();
  mappedScenarioInfo: MappedScenarioInfo[] = [];
  // testStepList: MappedScenarioInfo[] = [];
  dataLoading = false;
  emptyMessage = "";
  selectedProject = 0;

  mappedTestStepList: number[] = [];
  testStepsList: TestStepEdit[] = [];

  fetchedStepScenarioId = 0;
  testScenarioVersionId = "";

  constructor(
    private loginService: LoginService, private testMappingService: TestMappingService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ExistingMappingComponent>) {

    this.description = "Existing Mapping";
    this.selectedProject = data.selectedProject;
  }

  ngOnInit() {
    this.fetchAllMappedSteps();
  }

  selectScenario(scenarioMap: MappedScenarioInfo) {
    this.dialogRef.close(scenarioMap);
  }

  fetchAllMappedSteps() {
    this.dataLoading = true;
    this.testMappingService.getPreviouslySelectedSteps(this.data.selectedProject, this.data.selectedRelease, this.data.testCaseId, this.data.selectedTestCaseVersion).subscribe(result => {
      this.mappedStepsInfo = result;
      this.mappedStepsInfo.forEach((item, index) => {
        this.testScenarioVersionId = item.testScenarioVersionId;
        this.testScenarioIds.add(item.testStepScenarioId);
        this.mappedTestStepList.push(item.testStepId);
      });

      // this.testScenarioIds.forEach(scenarioId => {
      this.testMappingService.getTestCaseExistingMappedScenarioInfo(this.data.selectedProject, this.data.selectedRelease, this.data.testCaseId, this.data.selectedTestCaseVersion).subscribe(result => {
        if (result.testCaseId != 0) {
          this.mappedScenarioInfo.push(result);
        }
        this.dataLoading = false;
      });
      // });

      // this.dataLoading = false;

      if (this.testScenarioIds.size === 0) {
        this.emptyMessage = "No available mapping found for selected Test Case";
        this.dataLoading = false;
      }

    });
  }

  getTestSteps(scenario: ScenarioFile): void {

    this.fetchedStepScenarioId = scenario.testScenarioId;

    let featureScenario = new ScenarioFile();
    featureScenario.featureFileName = scenario.featureFileName;
    featureScenario.name = scenario.name;
    featureScenario.clientProjectId = this.selectedProject;
    this.testStepsList = [];
    this.testMappingService.getTestStepsService(scenario).subscribe(result => {

      for (var prop in result) {
        this.testStepsList = result[prop].testStepsList;
      }
    });

  }

  getStepName(name: string) {
    if (name.startsWith("Then ")) {
      return name.substring(5, name.length - 1);
    } else {
      return name;
    }
  }

  close() {
    this.dialogRef.close("cancel");
  }

}
