import { Component, OnInit } from '@angular/core';
import { TestMappingService } from "../test-mapping.service";
import { FeatureEditService } from "../feature-edit.service";
import { FeatureFile } from "../feature-scenario";
import { ScenarioFile, ScenarioEditDiff } from "../feature-scenario";
import { ScenarioEdit } from "../feature-scenario";
import { TestStepEdit } from "../feature-scenario";
import { TestStep } from "../testStep";
import { LoginService } from "../login.service"
import { ClientProjectService } from '../client-project.service'
import { ClientProject } from '../client-project'
import { UserProfileDetail } from '../user'
import { NotificationComponent } from '../../notification/notification.component';
import { MatDialog } from '@angular/material';
import { saveAs as importedSaveAs } from "file-saver";

@Component({
  selector: 'app-feature-edit',
  templateUrl: './feature-edit.component.html',
  styleUrls: ['./feature-edit.component.css']
})
export class FeatureEditComponent implements OnInit {

  constructor(private dialog: MatDialog, private clientProjectService: ClientProjectService,
    private testMappingService: TestMappingService, private featureEditService: FeatureEditService, private loginService: LoginService, ) { }

  // organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  userProfileDetail: UserProfileDetail = this.loginService.getUserInformationFromLocalStorage();
  organization: string = this.loginService.getUserInformationFromLocalStorage().defaultOrganization;
  clientProjects: ClientProject[] = [];
  clientProjectId: number;
  featureFile: FeatureFile[] = [];
  scenariosOfFeature: ScenarioFile[] = [];
  selectedFeature = "";
  selectedScenario: string;
  selectedScenarioID: number;
  selectedtestCaseId: number;
  selectedtestStepId: number;
  testStepsArr: TestStep[] = [];
  testStepsofScenario: ScenarioEdit[] = [];
  testStepsofScenarioDiff: any[] = [];
  darkMode = false;
  showProgressBar = false;
  showDiff = false;
  versions: any[] = [];
  firstVersion: number;
  secondVersion: number;
  featureFileModifiedData: string[] = [];

  featureData = "";
  javaCode = "";

  ngOnInit() {
    this.getProjectsByOrganizationName(this.organization);
  }

  testStepArr: string[] = [];

  getProjectsByOrganizationName(name: string) {
    this.organization = name;
    this.clientProjectService.getClientProjects()
      .subscribe(
        result => {
          this.clientProjects = result;
        });
    this.getAllFeature(this.organization, 0);
  }

  getAllFeature(organization, clientProjectId): void {
    this.testMappingService.getAllFeatureFiles(clientProjectId)
      .subscribe(result => {
        this.featureFile = result;
      });
  }

  getModuleHierarchyByProjectName(clientProjectId: number): void {
    this.selectedFeature = "";
    let allProjectTempId = 0;
    if (clientProjectId === undefined) {
      allProjectTempId = 0;
    } else {
      allProjectTempId = clientProjectId
    }
    this.getAllFeature(this.organization, allProjectTempId);

  }

  getTestStepsDiff(): void {
    this.versions.length = 0;
    this.featureFileModifiedData.length = 0;
    // this.showProgressBar = true;
    this.featureEditService.getAllScenarioWithStepsDiff(this.selectedFeature, this.organization, this.clientProjectId).subscribe(result => {
      this.testStepsofScenarioDiff = result;
      // this.showProgressBar = false;

      for (var prop in this.testStepsofScenarioDiff) {

        this.versions.push(prop);

        // loop through Scenario-Step Object and replace the prop names of scenario and step to distinguish them better

        this.testStepsofScenarioDiff[prop].forEach(scenario => {
          scenario.scenarioNamePintailer = scenario.name;
          delete scenario.name;

          scenario.testStepsList.forEach(steps => {
            steps.stepsNamePintailer = steps.name;
            delete steps.name;
          });

          // Moving the testStepsList prop below scenario name

          scenario.testStepsListNew = scenario.testStepsList;
          delete scenario.testStepsList;
        });
        let testCaseData = (JSON.stringify((this.testStepsofScenarioDiff[prop]), undefined, 2));

        // break the textblock into an array of lines
        var lines = testCaseData.split('\n');
        let correctLine: string[] = [];

        // Looping through each line and only allow line with custom markers like scenarioNamePintailer and stepsNamePintailer.
        // Also doing some formatting to make it look like a feature file.

        lines.forEach(line => {
          if (line.includes("scenarioNamePintailer")) {
            line = line.substring(line.indexOf(":") + 3, line.length - 2);
            line = "\nScenario: " + line;
            correctLine.push(line);
          } else if (line.includes("stepsNamePintailer")) {
            line = line.substring(line.indexOf(":") + 3, line.length - 2);
            line = "  " + line;
            correctLine.push(line);
          }
        });
        
        // join the array back into a single string
        testCaseData = correctLine.join('\n');

        this.featureFileModifiedData.push(testCaseData);

      }
    });

  }

  getTestSteps(): void {
    this.showProgressBar = true;
    this.featureEditService.getAllScenarioWithSteps(this.selectedFeature, this.organization, this.clientProjectId).subscribe(result => {
      this.testStepsofScenario = result;
      this.showProgressBar = false;
    });

  }

  getScenariosOf(): void {
    this.scenariosOfFeature = null;
    this.testMappingService.getScenariosOfFeature(this.selectedFeature, this.organization, this.clientProjectId).subscribe(result => {
      this.scenariosOfFeature = result;

    });
  }

  randomAddedId = 0;

  addStep(arrPlace1: number, arrPlace2: number) {
    // console.log("addStep");
    let testStep = new TestStepEdit();
    testStep.name = "";
    testStep.testStepId = this.randomAddedId;
    this.randomAddedId++;
    testStep.createdBy = this.userProfileDetail.userName;
    testStep.modifiedBy = this.userProfileDetail.userName;
    testStep.stepModificationStatus = "A";
    this.testStepsofScenario[arrPlace1].testStepsList.splice(arrPlace2, 0, testStep);
    if (this.testStepsofScenario[arrPlace1].scenarioModificationStatus != "A") {
      this.testStepsofScenario[arrPlace1].scenarioModificationStatus = "M";
    }

  }

  deleteStep(arrPlace1: number, arrPlace2: number) {
    // console.log("deleteStep " + this.testStepsofScenario[arrPlace1].testStepsList[arrPlace2].stepModificationStatus);
    if (this.testStepsofScenario[arrPlace1].testStepsList[arrPlace2].stepModificationStatus === "A") {
      this.testStepsofScenario[arrPlace1].testStepsList.splice(arrPlace2, 1);

    }
    else {
      this.testStepsofScenario[arrPlace1].testStepsList[arrPlace2].modifiedBy = this.userProfileDetail.userName;
      this.testStepsofScenario[arrPlace1].testStepsList[arrPlace2].stepModificationStatus = "D";
      if (this.testStepsofScenario[arrPlace1].scenarioModificationStatus != "A") {
        this.testStepsofScenario[arrPlace1].scenarioModificationStatus = "M";
      }
    }
  }

  undoDeleteStep(arrPlace1: number, arrPlace2: number) {
    // console.log("undoDeleteStep " + this.testStepsofScenario[arrPlace1].testStepsList[arrPlace2].stepModificationStatus);
    this.testStepsofScenario[arrPlace1].testStepsList[arrPlace2].modifiedBy = this.userProfileDetail.userName;
    this.testStepsofScenario[arrPlace1].testStepsList[arrPlace2].stepModificationStatus = "M";
    // this.testStepsofScenario[arrPlace1].scenarioModificationStatus = "M";
  }

  randomScenarioId = 0;

  addScenario(arrPlace1: number) {
    // console.log("addScenario");
    let newScenario = new ScenarioEdit();
    newScenario.name = "";
    newScenario.testScenarioId = this.randomScenarioId;
    this.randomScenarioId++;
    newScenario.createdBy = this.userProfileDetail.userName;
    newScenario.modifiedBy = this.userProfileDetail.userName;

    let testStepArr: TestStepEdit[] = [];
    let testStep = new TestStepEdit();
    testStep.name = "";
    testStep.testStepId = this.randomAddedId;
    this.randomAddedId++;
    testStep.createdBy = this.userProfileDetail.userName;
    testStep.modifiedBy = this.userProfileDetail.userName;
    testStep.stepModificationStatus = "A";
    testStepArr.push(testStep);

    newScenario.testStepsList = testStepArr;
    newScenario.scenarioTag = "";
    newScenario.clientProjectId = this.clientProjectId;
    newScenario.scenarioModificationStatus = "A";
    newScenario.background = false;
    newScenario.featureFileName = this.selectedFeature;
    newScenario.scenarioModificationStatus = "A";
    this.testStepsofScenario.splice(arrPlace1, 0, newScenario);
  }

  deleteScenario(arrPlace1: number) {
    // console.log("deleteScenario " + this.testStepsofScenario[arrPlace1].scenarioModificationStatus);
    if (this.testStepsofScenario[arrPlace1].scenarioModificationStatus === "A") {
      this.testStepsofScenario.splice(arrPlace1, 1);
    }
    else {
      this.testStepsofScenario[arrPlace1].modifiedBy = this.userProfileDetail.userName;
      this.testStepsofScenario[arrPlace1].scenarioModificationStatus = "D";
    }
  }

  undoDeleteScenario(arrPlace1: number) {
    // console.log("undoDeleteScenario " + this.testStepsofScenario[arrPlace1].scenarioModificationStatus);
    this.testStepsofScenario[arrPlace1].modifiedBy = this.userProfileDetail.userName;
    this.testStepsofScenario[arrPlace1].scenarioModificationStatus = "M";
  }

  textEdited(event: any, stepId: number, modifyStatus: string) {

    // console.log(stepId + "textEdited " + event.target.value);

    this.testStepsofScenario.forEach(element => {
      if (element.testStepsList != null) {
        element.testStepsList.forEach(elementStep => {
          if (elementStep.testStepId === stepId) {
            let teststep = event.target.value;
            // console.log("## " + teststep.replace(teststep.substr(0, teststep.indexOf(' ')), "Then"))
            // Inserting a 'Then' keywork before newly added scenario
            let allKeys = ["Then", "Given", "And", "But", "When"];
            let isSpace = teststep.indexOf(' ') > -1;
            if (isSpace) {
              let isKey = allKeys.includes(teststep.substr(0, teststep.indexOf(' ')));
              if (!isKey) {
                teststep = teststep.replace(teststep.substr(0, 0), "Then ");
              }
            }
            elementStep.name = teststep;
            // elementStep.name = event.target.value;
            elementStep.modifiedBy = this.userProfileDetail.userName;
            if (modifyStatus != "A") {
              elementStep.stepModificationStatus = "M";
              element.scenarioModificationStatus = "M";
            }
          }
        });
      }
    })
  }

  scenarioEdited(event: any, scenarioId: number, modifyStatus: string, tagEdit: boolean) {

    // console.log(scenarioId + " scenarioEdited " + event.target.value);

    this.testStepsofScenario.forEach(scenario => {
      if (scenario.testScenarioId === scenarioId) {
        if (tagEdit) {
          let enteredString = event.target.value;
          let lastChar = enteredString[enteredString.length - 1];
          if (lastChar === " ") {
            enteredString = enteredString + "@";
          }
          scenario.scenarioTag = enteredString;
        } else {
          scenario.name = event.target.value;
        }
        scenario.modifiedBy = this.userProfileDetail.userName;
        if (scenario.scenarioModificationStatus != "A") {
          scenario.scenarioModificationStatus = "M";
        }
      }
    })
  }

  prevInputBgColor: string;

  focusFunction(event: any) {
    this.prevInputBgColor = event.target.style["background-color"];
    event.target.style["opacity"] = .9;
  }

  focusOutFunction(event: any) {
    event.target.style["opacity"] = 1;
  }

  saveFeatureFile() {

    let canSave = true;

    let scenarioSeqCounter = 1;
    this.testStepsofScenario.forEach(element => {
      if (element.scenarioModificationStatus === "D") {
        element.scenarioSequence = 0;
      } else {
        element.scenarioSequence = scenarioSeqCounter;
        scenarioSeqCounter++;
      }

      element.scenarioSelectedVersion = null;

      let allKeys = ["Then", "Given", "And", "But", "When"];

      if (element.testStepsList != null) {
        element.testStepsList.forEach(elementStep => {
          elementStep.stepSelectedVersion = null;
          let isKey = allKeys.includes(elementStep.name.substr(0, elementStep.name.indexOf(' ')));
          if (!isKey) {
            canSave = false;
          }
        });
      }

    })

    if (canSave) {
      // console.log("saveFeatureFile");
      this.featureEditService.updateFeatureFile(this.testStepsofScenario, this.selectedFeature, this.organization, this.clientProjectId)
        .subscribe(
          result => {
            console.log("########### " + result);
            this.getTestSteps();
            this.getTestStepsDiff();
          });
    } else {
      this.openNotificationBar("Can Not Save. Missing Gherkin Keywords from feature steps. Please check.", "error", "normal");
    }
  }

  toggleDarkMode() {
    // console.log("@@@@@@@@@@@@@ " + this.darkMode)
    if (this.darkMode) {
      this.darkMode = false;
    }
    else {
      this.darkMode = true;
    }
  }

  exportFeatureFile() {
    let path = "%2Fdownload_report";
    this.featureEditService.downloadFeatureFile(this.selectedFeature, this.organization, this.clientProjectId, path)
      .subscribe(
        result => {

          let link = document.createElement('a');
          link.setAttribute('type', 'hidden');
          link.href = "./assets/downloads/" + result;
          link.download = result.toString();
          document.body.appendChild(link);
          link.click();
          link.remove();

          // window.open("./assets/downloads/" + result, 'Download')

        })
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

  clearData() {
    this.versions.length = 0;
    this.featureFileModifiedData.length = 0;
    this.testStepsofScenarioDiff.length = 0;
    this.testStepsofScenario.length = 0;
    this.showDiff = false;
    this.javaCode = "";
    this.featureData = "";
  }

  isCorrectFeatureFile() {
    // check if all Test Steps follow Gherkin Standards
    let canSave = true;
    this.testStepsofScenario.forEach(element => {
      let allKeys = ["Then", "Given", "And", "But", "When"];
      if (element.testStepsList != null) {
        element.testStepsList.forEach(elementStep => {
          let isKey = allKeys.includes(elementStep.name.substr(0, elementStep.name.indexOf(' ')));
          if (!isKey) {
            canSave = false;
          }
        });
      }

    })
    return canSave;
  }

  makeFeatureJavaSteps() {
    if (this.isCorrectFeatureFile()) {

      //Scrolls to Feture file and Java steps
      window.scroll({
        behavior: 'smooth',
        left: 0,
        top: document.getElementById("FeatureJavaFiles").offsetTop
      });

      this.featureData = "# Auto generated Feature File via http://pintailer.com/\n\n";
      let inputElements: any = document.querySelectorAll('.feature-input-element');
      inputElements.forEach(element => {
        if (element.classList.contains("feature-input-element-step")) {
          if (element.style["background-color"] != "crimson" && element.style["background-color"] != "lightcoral") {
            this.featureData += "      " + element.value + "\n";
          }
        } else if (element.classList.contains("feature-input-element-scenario-name")) {
          if (element.style["background-color"] != "crimson" && element.style["background-color"] != "lightcoral") {
            this.featureData += "    Scenario: " + element.value + "\n";
          }
        }
        else if (element.classList.contains("feature-input-element-feature-name")) {
          this.featureData += "    Feature: " + element.value + "\n\n";
        }
        else {
          if (element.style["background-color"] != "crimson" && element.style["background-color"] != "lightcoral") {
            this.featureData += element.value + "\n";
          }
        }
      });

      this.javaCode = "// Auto generated Java File via http://pintailer.com/\n\n";
      this.javaCode += "package my.package.name\nimport cucumber.api.PendingException;\nimport cucumber.api.java.en.Then;\nimport cucumber.api.junit.Cucumber;\nimport org.junit.runner.RunWith;\n\n@RunWith(Cucumber.class)\npublic class MyStepDefinitions {\n\n";

      let inputElementsTestStep: any = document.querySelectorAll('.feature-input-element-step');
      inputElementsTestStep.forEach(element => {
        if (element.style["background-color"] != "crimson" && element.style["background-color"] != "lightcoral") {

          let elementValue = element.value;

          // Removing text after Line Break to consider the data tables
          let subStr = elementValue;
          let indexOfLineChange = subStr.indexOf('\n');
          subStr = subStr.substring(0, indexOfLineChange != -1 ? indexOfLineChange : subStr.length);
          elementValue = subStr;

          let numOfDataPass = ((elementValue.match(/\"/g) || []).length) / 2;
          let keyword = elementValue.substr(0, elementValue.indexOf(' '));
          elementValue = elementValue.replace(keyword + " ", "");

          let passArguments = "";

          for (let i = 0; i < Math.floor(numOfDataPass); i++) {
            elementValue = elementValue.replace("\"", "#@#");
            elementValue = elementValue.replace("\"", "#@#");
            elementValue = elementValue.replace(/#@#.*#@#/, '#@@#@@#');
            passArguments += "String passedArg" + (i + 1) + ",";
          }

          let pos = passArguments.lastIndexOf(',');
          passArguments = passArguments.substring(0, pos);

          let elementValueSomething = elementValue.replace(/#@@#@@#/g, 'passedVariable');
          elementValue = elementValue.replace(/#@@#@@#/g, '\\"([^\\"]*)\\"');

          this.javaCode += "  @" + keyword + "('^" + elementValue + "$')\n";
          this.javaCode += "  public void " + elementValueSomething.split(' ').join('_') + "(" + passArguments + ") {\n";
          // this.javaCode += "    throw new PendingException();\n";
          this.javaCode += "  }\n\n";
        }
      });

      this.javaCode += "}";
    } else {
      this.openNotificationBar("Can Not Export. Missing Gherkin Keywords from feature steps. Please check.", "error", "normal");
    }
  }

  downloadFiles(data: string, type: string) {
    var blob = new Blob([data], {
      type: "text/plain;charset=utf-8"
    });
    importedSaveAs(blob, "pintailer-" + type + "-file." + type);
  }

}
