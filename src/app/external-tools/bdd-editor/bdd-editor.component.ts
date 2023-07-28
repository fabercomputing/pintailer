import { Component, OnInit } from '@angular/core';
import { TestMappingService } from "../../internalApp/test-mapping.service";
import { FeatureEditService } from "../../internalApp/feature-edit.service";
import { FeatureFile } from "../../internalApp/feature-scenario";
import { ScenarioFile, ScenarioEditDiff } from "../../internalApp/feature-scenario";
import { ScenarioEdit } from "../../internalApp/feature-scenario";
import { TestStepEdit } from "../../internalApp/feature-scenario";
import { TestStep } from "../../internalApp/testStep";
import { LoginService } from "../../internalApp/login.service"
import { ClientProjectService } from '../../internalApp/client-project.service'
import { ClientProject } from '../../internalApp/client-project'
import { saveAs as importedSaveAs } from "file-saver";
import { NotificationComponent } from '../../notification/notification.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-bdd-editor',
  templateUrl: './bdd-editor.component.html',
  styleUrls: ['./bdd-editor.component.css']
})
export class BddEditorComponent implements OnInit {


  constructor(private dialog: MatDialog, private clientProjectService: ClientProjectService,
    private testMappingService: TestMappingService, private featureEditService: FeatureEditService, private loginService: LoginService, ) { }

  // organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  // userProfileDetail: UserProfileDetail = this.loginService.getUserInformationFromLocalStorage();
  // organization: string = this.loginService.getUserInformationFromLocalStorage().defaultOrganization;
  clientProjects: ClientProject[] = [];
  clientProjectId: number;
  featureFile: FeatureFile[] = [];
  scenariosOfFeature: ScenarioFile[] = [];
  selectedFeature: string;
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
  userName = "Visitor";

  featureData = "";
  javaCode = "";

  ngOnInit() {
    this.getTestSteps();
  }

  testStepArr: string[] = [];

  getTestSteps(): void {
    this.showProgressBar = true;

    this.testStepsofScenario = [{
      "testScenarioId": 446,
      "name": "Heading of your feature file",
      "featureFileName": "mainFeatureTag.feature",
      "createdBy": "",
      "modifiedBy": "",
      "clientProjectId": 2,
      "scenarioTag": "@sampleFeatureTag",
      "scenarioSequence": 0,
      "scenarioModificationStatus": "U",
      "testStepsList": null,
      "scenarioLatestVersion": "V1",
      "scenarioSelectedVersion": "V1",
      "feature": true,
      "deleted": false,
      "background": false,
      "scenarioOutline": false
    },
    {
      "testScenarioId": 262,
      "name": "Describe here what your scenario does",
      "featureFileName": "sample.feature",
      "createdBy": "",
      "modifiedBy": "",
      "clientProjectId": 2,
      "scenarioTag": "@scenarioTag @multipleScenarioTag",
      "scenarioSequence": 0,
      "scenarioModificationStatus": "U",
      "testStepsList": [{
        "testStepId": 2424,
        "name": "Then first scenario step",
        "hashCode": "8c879a38cdf62155a56e1bcaa17281e3",
        "createdBy": "",
        "modifiedBy": "",
        "createdDate": 1538187257293,
        "modifiedDate": 1552555503134,
        "stepModificationStatus": "U",
        "stepLatestVersion": "V1",
        "stepSelectedVersion": null,
        "deleted": false,
        "checkedStep": ""
      }, {
        "testStepId": 5249,
        "name": "Then \"second\" scenario step with some \"data\"",
        "hashCode": "b809d152a609dc4232003139a9c165dc",
        "createdBy": "",
        "modifiedBy": "",
        "createdDate": 1552895410020,
        "modifiedDate": 1552895709703,
        "stepModificationStatus": "U",
        "stepLatestVersion": "V5",
        "stepSelectedVersion": null,
        "deleted": false,
        "checkedStep": ""
      }, {
        "testStepId": 5223,
        "name": "And third scenario step",
        "hashCode": "14157cb9cbc40e2aad5f3d3fa0b59748",
        "createdBy": "",
        "modifiedBy": "",
        "createdDate": 1552455797242,
        "modifiedDate": 1552532009804,
        "stepModificationStatus": "U",
        "stepLatestVersion": "V1",
        "stepSelectedVersion": null,
        "deleted": false,
        "checkedStep": ""
      }],
      "scenarioLatestVersion": "V1",
      "scenarioSelectedVersion": "V1",
      "feature": false,
      "deleted": false,
      "background": false,
      "scenarioOutline": false
    }];
    // this.featureEditService.getAllScenarioWithSteps(this.selectedFeature, this.organization, this.clientProjectId).subscribe(result => {
    //   this.testStepsofScenario = result;
    //   this.showProgressBar = false;
    // });
    this.showProgressBar = false;
  }

  randomAddedId = 0;

  addStep(arrPlace1: number, arrPlace2: number) {
    // console.log("addStep");
    let testStep = new TestStepEdit();
    testStep.name = "";
    testStep.testStepId = this.randomAddedId;
    this.randomAddedId++;
    testStep.createdBy = this.userName;
    testStep.modifiedBy = this.userName;
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
      this.testStepsofScenario[arrPlace1].testStepsList[arrPlace2].modifiedBy = this.userName;
      this.testStepsofScenario[arrPlace1].testStepsList[arrPlace2].stepModificationStatus = "D";
      if (this.testStepsofScenario[arrPlace1].scenarioModificationStatus != "A") {
        this.testStepsofScenario[arrPlace1].scenarioModificationStatus = "M";
      }
    }
  }

  undoDeleteStep(arrPlace1: number, arrPlace2: number) {
    // console.log("undoDeleteStep " + this.testStepsofScenario[arrPlace1].testStepsList[arrPlace2].stepModificationStatus);
    this.testStepsofScenario[arrPlace1].testStepsList[arrPlace2].modifiedBy = this.userName;
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
    newScenario.createdBy = this.userName;
    newScenario.modifiedBy = this.userName;

    let testStepArr: TestStepEdit[] = [];
    let testStep = new TestStepEdit();
    testStep.name = "";
    testStep.testStepId = this.randomAddedId;
    this.randomAddedId++;
    testStep.createdBy = this.userName;
    testStep.modifiedBy = this.userName;
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
      this.testStepsofScenario[arrPlace1].modifiedBy = this.userName;
      this.testStepsofScenario[arrPlace1].scenarioModificationStatus = "D";
      this.testStepsofScenario[arrPlace1].testStepsList.forEach(element => {
        element.stepModificationStatus = "D";
      });
    }
  }

  undoDeleteScenario(arrPlace1: number) {
    // console.log("undoDeleteScenario " + this.testStepsofScenario[arrPlace1].scenarioModificationStatus);
    this.testStepsofScenario[arrPlace1].modifiedBy = this.userName;
    this.testStepsofScenario[arrPlace1].scenarioModificationStatus = "M";
    this.testStepsofScenario[arrPlace1].testStepsList.forEach(element => {
      element.stepModificationStatus = "M";
    });
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
            elementStep.modifiedBy = this.userName;
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
        scenario.modifiedBy = this.userName;
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

  toggleDarkMode() {
    // console.log("@@@@@@@@@@@@@ " + this.darkMode)
    if (this.darkMode) {
      this.darkMode = false;
    }
    else {
      this.darkMode = true;
    }
  }

  canExport() {
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
    return canSave;
  }

  exportFeatureFile() {

    if (this.canExport()) {
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

          // elementValue = elementValue.replace(/".*"/, '2222222');
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
  }

  downloadFiles(data: string, type: string) {
    var blob = new Blob([data], {
      type: "text/plain;charset=utf-8"
    });
    importedSaveAs(blob, "pintailer-" + type + "-file." + type);
  }

}
