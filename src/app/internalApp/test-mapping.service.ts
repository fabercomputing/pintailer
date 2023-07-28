import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { MessageService } from './message.service';
import { environment } from '../../environments/environment';
import { FeatureFile } from './feature-scenario';
import { ScenarioFile } from './feature-scenario';
import { TestStep } from "./testStep";
import { TestMap } from "./testMap";
import { TestStepEdit } from "./feature-scenario";
import { FeatureScenario, MappedScenarioInfo } from "./feature-scenario";

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class TestMappingService {
  private testMapUrl = environment.apiUrl;  // URL to web api
  constructor(private http: HttpClient,
    private messageService: MessageService) { }

  /** GET All feature files from the server */
  getAllFeatureFiles(clientProjectId: number): Observable<FeatureFile[]> {
    let params = new HttpParams();
    params = params.append('clientProjectId', clientProjectId.toString());
    return this.http.get<FeatureFile[]>(this.testMapUrl + "testScenarios/getFeatureNames", { params: params })
      .pipe(
        tap(AssetTypeDefinitions => this.log(`fetched getAllFeatureFiles`)),
        catchError(this.handleError('getAllFeatureFiles', []))
      );
  }

  /** GET scenarios of a feature file */

  getScenariosOfFeature(featureName: string, clientOrganization: string, clientProjectId: number): Observable<ScenarioFile[]> {
    let params = new HttpParams();
    params = params.append('clientOrganization', clientOrganization);
    params = params.append('clientProjectId', clientProjectId.toString());
    params = params.append('featureName', featureName);
    return this.http.get<ScenarioFile[]>(this.testMapUrl + "testScenarios/getTestScenariosByFeatureName", { params: params })
      .pipe(
        tap(users => this.log(`fetched scenarios of a feature file`)),
        catchError(this.handleError('getScenariosOfFeature', []))
      );
  }

  /** GET scenarios info from scenarion ID */

  getScenariosFromScenarioId(clientProjectId: number, scenarioId: number, testScenariosVersionId: string): Observable<ScenarioFile> {
    return this.http.get<ScenarioFile>(this.testMapUrl + "testScenarios/getTestScenarios?clientProjectId=" + clientProjectId + "&testScenariosId=" + scenarioId + "&testScenariosVersionId=" + testScenariosVersionId)
      .pipe(
        // tap(users => this.log(`scenarios info from scenarion ID`)),
        // catchError(this.handleError('getScenariosFromScenarioId', []))
      );
  }

  /** POST: get test step for a scenario */
  getTestStepsService(featureScenario: ScenarioFile): Observable<any[]> {
    return this.http.post<any[]>(this.testMapUrl + "testStep/getTestStepByScenario/", featureScenario, httpOptions)
      .pipe(
        tap((testStep: any[]) => {
        }), catchError(this.handleError('getTestStepsService', []))
      );
  }

  /** POST: Map test cases */
  mapTestCaseToStep(projectId: number, releaseId: number, testCaseId: number, testCaseVersionId: string, testStepIds: string, testScenarioId: number, testScenarioStepVersionId: number): Observable<TestStep[]> {
    return this.http.post<TestStep[]>(this.testMapUrl + "testCaseMap/addTestCaseMap?clientProjectId=" + projectId + "&releaseId=" + releaseId + "&testCaseId=" + testCaseId + "&testCaseVersionId=" + testCaseVersionId + "&selectedTestStepIds=" + testStepIds + "&testScenarioId=" + testScenarioId + "&testScenarioStepVersionId=" + testScenarioStepVersionId, httpOptions)
      .pipe(
        tap((testStep: TestStep[]) => {
        }), catchError(this.handleError('mapTestCaseToStep', []))
      );
  }

  /** GET Previously Selected Steps */

  getPreviouslySelectedSteps(projectId: number, releaseId: number, testCaseId: number, testCaseVersionId: string): Observable<TestMap[]> {
    return this.http.get<TestMap[]>(this.testMapUrl + "testCaseMap/getTestStepByTestCaseId?clientProjectID=" + projectId + "&releaseId=" + releaseId + "&testCaseId=" + testCaseId + "&testCaseVersionId=" + testCaseVersionId)
      .pipe(
        tap(testStep => this.log(`GET Previously Selected Steps`)),
        catchError(this.handleError('getPreviouslySelectedSteps', []))
      );
  }

  /** GET TestCase Existing Mapped Scenario Info */

  getTestCaseExistingMappedScenarioInfo(projectId: number, releaseId: number, testCaseId: number, testCaseVersionId: string): Observable<MappedScenarioInfo> {
    return this.http.get<MappedScenarioInfo>(this.testMapUrl + "testCaseMap/getTestCaseExistingMappedScenarioInfo?clientProjectID=" + projectId + "&releaseId=" + releaseId + "&testCaseId=" + testCaseId + "&testCaseVersionId=" + testCaseVersionId)
      .pipe(
        tap(testStep => this.log(`GET TestCase Existing Mapped Scenario Info`)),
        catchError(this.handleError<MappedScenarioInfo>('getTestCaseExistingMappedScenarioInfo'))
      );
  }

  /** Delete All Mapped Steps */

  deleteAllMappedSteps(projectId: number, releaseId: number, testcaseId: number, scenarioId: number): Observable<TestMap[]> {
    return this.http.delete<TestMap[]>(this.testMapUrl + "testCaseMap/deleteTestStepByTestCaseId?clientProjectId=" + projectId + "&releaseId=" + releaseId + "&testCaseId=" + testcaseId + "&scenarioID=" + scenarioId)
      .pipe(
        tap(testStep => this.log(`Delete All Mapped Steps`)),
        catchError(this.handleError('deleteAllMappedSteps', []))
      );
  }

  /** POST: Temp menthod for rishi singhal */
  addDummyData(): Observable<TestMap[]> {
    return this.http.post<TestMap[]>(this.testMapUrl + "testScenarios/addDummyTestScenario", httpOptions)
      .pipe(
        tap(testMap => this.log(`addDummyData`)),
        catchError(this.handleError('addDummyData', []))
      );
  }

  /** GET All Test Steps */

  getAllTestSteps(org: string, project: number): Observable<TestStepEdit[]> {
    return this.http.get<TestStepEdit[]>(this.testMapUrl + "/testStep/getTestStep?clientOrganization=" + org + "&clientProjectId=" + project)
      .pipe(
        tap(testStep => this.log(`GET All Test Steps`)),
        catchError(this.handleError('getAllTestSteps', []))
      );
  }

  /**
 * Handle Http operation that failed.
 * Let the app continue.
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result
 */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a UserService message with the MessageService */
  private log(message: string) {
    this.messageService.add('TestMappingService: ' + message);
  }

}
