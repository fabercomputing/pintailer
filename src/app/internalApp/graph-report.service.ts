import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Reports } from './reports';
import { ExecutionReport } from './reports';
import { OrgCoverageData } from './reports';

import { MessageService } from './message.service';

import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class GraphReportService {
  private reportsUrl = environment.apiUrl;  // URL to web api
  constructor(private http: HttpClient,
    private messageService: MessageService) { }


  /** GET: get the coverage report for a particular client ID */

  getCoverageReportForID(clientID: number, tag: string, moduleID: number): Observable<Reports> {
    return this.http.get<Reports>(this.reportsUrl + "/reports/getAutomationReport?clientProjectId=" + clientID + "&tagValue=" + tag + "&moduleId=" + moduleID + "&applicable=" + true + "&startDate=" + null + "&endDate=" + null)
      .pipe(
        tap(users => this.log(`get the coverage report`)),
        catchError(this.handleError<Reports>('getCoverageReportForID'))
      );
  }

  /** GET: get the Execution Report*/

  getExecutionReport(clientID: number, moduleID: number, releaseId: number, envId: number): Observable<ExecutionReport> {
    return this.http.get<ExecutionReport>(this.reportsUrl + "/reports/getExecutionReport?clientProjectId=" + clientID + "&moduleId=" + moduleID + "&releaseId=" + releaseId + "&environmentId=" + envId)
      .pipe(
        tap(users => this.log(`get the Execution Report`)),
        catchError(this.handleError<ExecutionReport>('getExecutionReport'))
      );
  }

  /** GET: get the Dashboard Report*/

  getOrgCoverageDashboard(): Observable<OrgCoverageData[]> {
    return this.http.get<OrgCoverageData[]>(this.reportsUrl + "/reports/getDashboardReport")
      .pipe(
        tap(users => this.log(`get the Dashboard Report`)),
        catchError(this.handleError<OrgCoverageData[]>('getOrgCoverageDashboard'))
      );
  }

  /** GET: download the Execution Report*/

  downloadExecutionReport(clientID: number, releaseId: number, envId: number, format: string, path: string) {
    return this.http.get(this.reportsUrl + "/reports/downloadReport?clientProjectId=" + clientID + "&releaseId=" + releaseId + "&environmentId=" + envId + "&reportFileFormat=" + format + "&reportFilePath=" + path, {
      responseType: "text"
    })
      .pipe(
        tap(users => this.log(`get the Execution Report`)),
        catchError(this.handleError<ExecutionReport>('downloadExecutionReport'))
      );
  }

  /** GET: download the Execution Report*/

  downloadRemainingData(format: string, fileName: string, path: string, caseId: any[]) {
    return this.http.get(this.reportsUrl + "/reports/downloadManualExecutionTemplate?templateFormat=" + format + "&fileName=" + fileName + "&filePath=" + path + "&testCaseIds=" + caseId, {
      responseType: "text"
    })
      .pipe(
        tap(users => this.log(`get the Execution Report`)),
        catchError(this.handleError<ExecutionReport>('downloadRemainingData'))
      );
  }

  /** GET: download the Test Cases*/

  downloadTestCases(format: string, fileName: string, path: string, caseId: any[]) {
    return this.http.get(this.reportsUrl + "/reports/downloadTestCases?format=" + format + "&fileName=" + fileName + "&filePath=" + path + "&testCaseIds=" + caseId, {
      responseType: "text"
    })
      .pipe(
        tap(users => this.log(`download the Test Cases`)),
        catchError(this.handleError<ExecutionReport>('downloadTestCases'))
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
    this.messageService.add('AssetInfoService: ' + message);
  }

}
