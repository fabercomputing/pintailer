export class FeatureFile {

  featureFileName: string;

}


export class MappedScenarioInfo {
  testCaseMapVersionId: number;
  testCaseId: number;
  testCaseVersionId: number;
  selectedTestStepsIdAndVersion: string;
  testScenarioStepVersionId: number;
  createdBy: string;
  modifiedBy: string;
  createdDate: number;
  modifiedDate: number;
  testCaseMapVersion: string;
  testScenarios: ScenarioFile;
  hardDeleted: boolean;
}


export class ScenarioFile {
  testScenarioId: number;
  clientProjectId: number;
  name: string;
  featureFileName: string;
  createdBy: string;
  modifiedBy: string;
  deleted: boolean;
  scenarioLatestVersion: string;
  scenarioSelectedVersion: string;
  existingVersions: string;
}

export class FeatureScenario {
  featureFileName: string;
  name: string;
  clientProjectId: number;
}

export class ScenarioEditDiff {
  versions: any;
}

export class ScenarioEdit {

  testScenarioId: number;
  name: string;
  featureFileName: string;
  createdBy: string;
  modifiedBy: string;
  deleted: boolean;
  clientProjectId: number;
  scenarioTag: string;
  scenarioModificationStatus: string;
  testStepsList: TestStepEdit[];
  feature: boolean;
  background: boolean;
  scenarioSequence: number;
  scenarioLatestVersion: string;
  scenarioSelectedVersion: string;
  scenarioOutline: boolean;
}

export class TestStepEdit {
  testStepId: number;
  name: string;
  createdBy: string;
  modifiedBy: string;
  deleted: boolean;
  stepModificationStatus: string;
  hashCode: string;
  createdDate?: number;
  modifiedDate?: number;
  stepLatestVersion: string;
  stepSelectedVersion: string;
  checkedStep: string;
}