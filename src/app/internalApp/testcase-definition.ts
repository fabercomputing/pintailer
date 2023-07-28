import { ClientProject } from './client-project'

export class TestCaseDefinition {
  testCaseId: number;
  testCaseSequenceId: number;
  testCaseNo: string;
  testData: string;
  testSummary: string;
  preCondition: string;
  tags: string[] = [];
  executionSteps: string;
  expectedResult: string;
  automatable: boolean;
  remarks: string;
  fileName: string;
  automatedTestCaseNoFromFile: string;
  manualReason: string;
  applicable: boolean;
  createdBy: string;
  modifiedBy: string;
  modulesNameHierarchy: string;
  deleted: boolean;
  moduleId: number;
  createdDate: number;
  testCaseVersion: string;
  latestVersion: string;
  mappedToRelease: boolean;
  selectedVersion: string;
  productionBug: boolean;
  bugsAndTypes: string;
}


export class TestCaseDefinitionImport {
  project: ClientProject;
  userName: String;
  environmentId?: number;
  environment?: string;
  releaseId?: number;
  releaseName?: string;
}