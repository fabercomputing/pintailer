export class Reports {
    clientProjectId?: number;
    totalTestCaseIds?: number[];
    totalAutomatableTestCaseIds: number[];
    automatedTestCaseIds: number[];
    pendingAutomatedTestCaseIds: number[];
    totalManualTestCaseIds: number[];
    criticalTestCaseCount: number;
    majorTestCaseCount: number;
    minorTestCaseCount: number;
    criticalAutomatedTestCaseCount: number;
    majorAutomatedTestCaseCount: number;
    minorAutomatedTestCaseCount: number;
    automatablePercentage: number;
    automatedPercentage: number;
    pendingAutomatedPercentage: number;
    criticalAutomatedPercentage?: number;
    majorAutomatedPercentage?: number;
    manualPercentage: number;
}

export class ExecutionReport {
    clientOrganisation: string;
    clientProjectId: number;
    moduleId: number;
    envId: number;
    releaseId: number;
    totalTestCaseCount: number;
    totalExecutedTestCaseCount: number;
    testCaseExecutionStatusInfo: ExecutionData;
    testStepsStatus: StepData;
    durationInfo: DurationData;
    nonAutomatedTestCaseIdList: ReadonlyArray<{}> = [];
}

export class ExecutionData {
    fail: string[];
    pass: string[];
    pending: string[];
    skip: string[];
    block: string[];
    executionRemaining: string[];
}

export class StepData {
    data: ExecutionData;
}

export class DurationData {
    fail: number;
    pass: number;
}

export class OrgCoverageData {
    project: string;
    testCasesCount: string;
    type: string;
}
