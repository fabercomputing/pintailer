import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { catchError, tap } from 'rxjs/operators';

import { TestCaseExecution } from './testcase-execution';
import { MessageService } from './message.service';
import { environment } from '../../environments/environment';
import { HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { TestCaseDefinition, TestCaseDefinitionImport } from './testcase-definition';
import { CommonService } from '../internalApp/common.service'

import { Observable, Subject, of } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class TestcaseExecutionService {

  private testCaseExecutionUrl = environment.apiUrl;  // URL to web api
  constructor(
    private commonService: CommonService,
    private http: HttpClient,
    private messageService: MessageService
  ) { }

  /** POST: add a new test case execution to the server */
  addTestCaseExecution(testCaseExecution: TestCaseExecution): Observable<TestCaseExecution> {
    return this.http.post<TestCaseExecution>(this.testCaseExecutionUrl + "testCaseExecutions/addTestCaseExecutions", testCaseExecution, httpOptions)
      .pipe(
        tap((testCaseExecution: TestCaseExecution) => this.log(`added testCaseExecution`)),
        catchError(this.handleError<TestCaseExecution>('addTestCaseExecution'))
      );
  }

  /** GET Execution detail */

  getSpecificTestCaseExecutionsDetails(testCaseExecutionsId: number, testCaseId: number, releaseID: number, envID: number): Observable<TestCaseExecution> {
    return this.http.get<TestCaseExecution>(this.testCaseExecutionUrl + "/testCaseExecutions/getSpecificTestCaseExecutionsDetails?testCaseExecutionsId=" + testCaseExecutionsId + "&testCaseId=" + testCaseId + "&releaseId=" + releaseID + "&environmentId=" + envID)
      .pipe(
        tap((testCaseExecution: TestCaseExecution) => this.log(`GET Execution detail`)),
        catchError(this.handleError<TestCaseExecution>('getSpecificTestCaseExecutionsDetails'))
      );
  }

  /** POST: import a new test case execution file to the server */
  importTestCaseExecutionnFile(files: Set<File>, clientProjectId: number, envID: number, releaseID: number, isSync: boolean): { [key: string]: Observable<number> } {
    // this will be the our resulting map
    const status = {};
    const url = "testCaseExecutions/importTestExecution?clientProjectId=" + clientProjectId + "&environmentId=" + envID + "&releaseId=" + releaseID + "&isSync=" + isSync

    files.forEach(file => {
      // create a new multipart-form for every file
      const formData: FormData = new FormData();
      formData.append('file', file, file.name);

      // const blobOverrides = new Blob([JSON.stringify(otherAttribute)], {
      //   type: 'application/json',
      // });

      // formData.append('action', clientProjectId);

      // create a http-post request and pass the form
      // tell it to report the upload progress
      const req = new HttpRequest('POST', this.testCaseExecutionUrl + url, formData, {
        reportProgress: true
      });

      // create a new progress-subject for every file
      const progress = new Subject<number>();

      // send the http-request and subscribe for progress-updates
      this.http.request(req).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {

          // calculate the progress percentage
          const percentDone = Math.round(100 * event.loaded / event.total);

          // pass the percentage into the progress-stream
          progress.next(percentDone);
        } else if (event instanceof HttpResponse) {

          // Close the progress-stream if we get an answer form the API
          // The upload is complete
          progress.complete();
        }
      }, (err) => {
        this.commonService.openNotificationBar(err, "error", "normal");
      }, () => {
        this.commonService.openNotificationBar("File uploaded sucessfully", "notification_important", "normal");
      });

      // Save every progress-observable in a map of all observables
      status[file.name] = {
        progress: progress.asObservable()
      };
    });

    // return the map of progress.observables
    return status;
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
    this.messageService.add('TestcaseExecutionService: ' + message);
  }

}
