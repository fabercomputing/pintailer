import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEventType, HttpResponse, HttpParams } from '@angular/common/http';

import { Observable, Subject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { TestCaseDefinition, TestCaseDefinitionImport } from './testcase-definition';
import { MessageService } from './message.service';
import { environment } from '../../environments/environment';
import { CommonService } from '../internalApp/common.service'
import { saveAs as importedSaveAs } from "file-saver";

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class TestcaseDefinitionService {

  private testCaseDefinitionUrl = environment.apiUrl;  // URL to web api
  constructor(
    private commonService: CommonService,
    private http: HttpClient,
    private messageService: MessageService) { }

  /** GET test case definitions from the server */
  getTestCaseDefinitions(clientOrganization: string, clientProjectId: number, applicableCon: string, sortByColumn: string, searchTxt: string, ascOrDesc: string, pageNumber: number, limit: number): Observable<TestCaseDefinition[]> {

    let params = new HttpParams();
    params = params.append('clientOrganization', clientOrganization);
    params = params.append('clientProjectId', clientProjectId.toString());
    params = params.append('applicable', applicableCon);
    params = params.append('sortByColumn', sortByColumn);
    params = params.append('ascOrDesc', ascOrDesc);
    params = params.append('searchTxt', searchTxt);
    params = params.append('limit', limit.toString());
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('startDate', null);
    params = params.append('endDate', null);
    params = params.append('isDeleted', "false");
    // console.log("*******************************" + params)
    return this.http.get<TestCaseDefinition[]>(this.testCaseDefinitionUrl + "testCase/getTestCasesClientList", { params: params })
      .pipe(
        tap(testCaseDefinitions => this.log(`fetched testCaseDefinitions`)),
        catchError(this.handleError('getTestCaseDefinitions', []))
      );
  }

  /** POST: add a new test case definition to the server */
  addTestCaseDefinition(testCaseDefinition: TestCaseDefinition): Observable<TestCaseDefinition> {
    return this.http.post<TestCaseDefinition>(this.testCaseDefinitionUrl + "testCase/addTestCase", testCaseDefinition, httpOptions)
      .pipe(
        tap((testCaseDefinition: TestCaseDefinition) => this.log(`added testCaseDefinition w/ testCaseSequenceId=${testCaseDefinition.testCaseSequenceId}`)),
        catchError(this.handleError<TestCaseDefinition>('addTestCaseDefinition'))
      );
  }

  /** PUT: update a new test case definition to the server */
  updateTestCaseDefinition(testCaseDefinition: TestCaseDefinition, releaseId: number, isTestCaseDataUpdated: boolean): Observable<TestCaseDefinition> {
    return this.http.patch<TestCaseDefinition>(this.testCaseDefinitionUrl + "testCase/updateTestCaseById?releaseId=" + releaseId + "&isTestCaseDataUpdated=" + isTestCaseDataUpdated, testCaseDefinition, httpOptions)
      .pipe(
        tap((testCaseDefinition: TestCaseDefinition) => this.log(`updated testCaseDefinition w/ testCaseSequenceId=${testCaseDefinition.testCaseSequenceId}`)),
        catchError(this.handleError<TestCaseDefinition>('updateTestCaseDefinition'))
      );
  }

  /** GET list of test cases for particular module */

  getTestCaseForModule(projectId: number, releaseId: number, moduleId: number): Observable<TestCaseDefinition[]> {
    return this.http.get<TestCaseDefinition[]>(this.testCaseDefinitionUrl + "testCase/getTestCaseByModule?clientProjectId=" + projectId + "&releaseId=" + releaseId + "&moduleId=" + moduleId + "&applicable=" + "true" + "&isDeleted=" + false)
      .pipe(
        tap(users => this.log(`GET list of test cases`)),
        catchError(this.handleError('getTestCaseForModule', []))
      );
  }

  /** GET count of test cases */

  getTestCaseCount(clientProjectId: number, applicableCon: string, searchTxt: string): Observable<number[]> {
    return this.http.get<number[]>(this.testCaseDefinitionUrl + "/testCase/getTestCasesCount?clientProjectId=" + clientProjectId + "&applicable=" + applicableCon + "&searchTxt=" + searchTxt)
      .pipe(
        tap(users => this.log(`GET count of test cases`)),
        catchError(this.handleError('getTestCaseCount', []))
      );
  }

  /** GET list of test cases with version info for particular testcase */

  getTestCaseVersionInfo(testCaseId: number): Observable<TestCaseDefinition[]> {
    return this.http.get<TestCaseDefinition[]>(this.testCaseDefinitionUrl + "testCase/getTestCaseVersion?testCaseId=" + testCaseId)
      .pipe(
        tap(users => this.log(`GET list of test cases with version info for particular testcase`)),
        catchError(this.handleError('getTestCaseVersionInfo', []))
      );
  }

  /** GET list of test cases for Id List */

  getTestCaseForIds(clientProjectId: number, applicableCon: string, value: string[]): Observable<TestCaseDefinition[]> {
    let params = new HttpParams();
    params = params.append('clientProjectId', clientProjectId.toString());
    params = params.append('applicable', applicableCon);
    params = params.append('testCaseIds', value.toString());
    params = params.append('sortByColumn', null);
    params = params.append('ascOrDesc', null);
    params = params.append('searchTxt', null);
    params = params.append('limit', "0");
    params = params.append('pageNumber', "0");
    params = params.append('startDate', null);
    params = params.append('endDate', null);
    params = params.append('isDeleted', "false");
    return this.http.get<TestCaseDefinition[]>(this.testCaseDefinitionUrl + "testCase/getTestCaseListByIds/", { params: params })
      .pipe(
        tap(users => this.log(`GET list of test cases for Id List`)),
        catchError(this.handleError('getTestCaseForIds', []))
      );
  }

  /** GET Tags List from the server */
  getTagsList(projectId: number): Observable<TestCaseDefinition[]> {
    return this.http.get<TestCaseDefinition[]>(this.testCaseDefinitionUrl + "testCase/getTags?clientProjectId=" + projectId)
      .pipe(
        tap(moduleHierarchy => this.log(`fetched getTagsList`)),
        catchError(this.handleError('getTagsList', []))
      );
  }

  /** POST: import a new test case definition file to the server */
  importTestCaseDefinitionFile(files: Set<File>, clientProjectId: number): { [key: string]: Observable<number> } {
    // this will be the our resulting map
    const status = {};
    const url = "testCase/importTestCase?clientProjectId=" + clientProjectId;
    let sucessCount = 0;

    files.forEach(file => {
      // create a new multipart-form for every file
      const formData: FormData = new FormData();
      formData.append('file', file, file.name);

      // const blobOverrides = new Blob([JSON.stringify(otherAttribute)], {
      //   type: 'application/json',
      // });

      // formData.append('action', blobOverrides);

      // create a http-post request and pass the form
      // tell it to report the upload progress
      const req = new HttpRequest('POST', this.testCaseDefinitionUrl + url, formData, {
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
        sucessCount++;
        if(sucessCount === 1){
          this.commonService.openNotificationBar("File uploaded sucessfully", "notification_important", "normal");
        }
        // console.log(event.currentTarget["response"])
        var obj = JSON.parse(event.currentTarget["response"]);
        var data: TestCaseDefinition[] = [];
        data = obj;
        var text = "duplicates: ";
        data.forEach(element => {
          text += element.testSummary
          text += " \n....."
        });
        if (data.length > 0) {
          var json = data
          var fields = Object.keys(json[0])
          var replacer = function (key, value) { return value === null ? '' : value }
          var csv = json.map(function (row) {
            return fields.map(function (fieldName) {
              return JSON.stringify(row[fieldName], replacer)
            }).join(',')
          })
          csv.unshift(fields.join(',')) // add header column

          var blob = new Blob([csv.join('\r\n')], {
            type: "text/csv;charset=utf-8;",
          });
          importedSaveAs(blob, "duplicate_test_cases_list.csv");
        }
      }

      );

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
    this.messageService.add('TestcaseDefinitionService: ' + message);
  }

}
