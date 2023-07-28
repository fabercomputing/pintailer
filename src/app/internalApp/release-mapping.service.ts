import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { MessageService } from './message.service';
import { environment } from '../../environments/environment';
import { Release } from "./release";
import { ReleaseMap } from "./release";
import { TestCaseDefinition } from './testcase-definition';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ReleaseMappingService {
  private releaseMapUrl = environment.apiUrl;  // URL to web api
  constructor(private http: HttpClient,
    private messageService: MessageService) { }

  /** GET scenarios of a feature file */

  getAllReleaseInfo(clientProjectId: number, condition: string): Observable<Release[]> {
    return this.http.get<Release[]>(this.releaseMapUrl + "release/getAllReleases?clientProjectId=" + clientProjectId + "&condition=" + condition)
      .pipe(
        tap(users => this.log(`fetched all release info`)),
        catchError(this.handleError('getAllReleaseInfo', []))
      );
  }

  /** POST: Add Release */
  addNewRelease(releaseInfo: Release): Observable<Release[]> {
    return this.http.post<Release[]>(this.releaseMapUrl + "release/addRelease", releaseInfo, httpOptions)
      .pipe(
        tap((releases: Release[]) => {
          tap(users => this.log(`Add Release`)),
            catchError(this.handleError('AddNewRelease', []))
        })
      );
  }

  /** PUT: update release information */
  updateRelease(releaseInfo: Release): Observable<Release> {
    return this.http.patch<Release>(this.releaseMapUrl + "/release/updateRelease", releaseInfo, httpOptions)
      .pipe(
        tap(users => this.log(` update release information `)),
        catchError(this.handleError<Release>('updateRelease'))
      );
  }

  /** POST: Map release testcase */
  mapTestCaseToRelease(projectId: number, releaseMap: ReleaseMap): Observable<ReleaseMap[]> {

    return this.http.post<ReleaseMap[]>(this.releaseMapUrl + "release/addReleaseMapBatch?clientProjectId=" + projectId, releaseMap, httpOptions)
      .pipe(
        tap((releaseMap: ReleaseMap[]) => {
          tap(users => this.log(`Map release testcase`)),
            catchError(this.handleError('mapTestCaseToRelease', []))
        })
      );
  }

  /** GET Previously Selected Cases For Release */

  getPreviouslySelectedCasesForRelease(releaseUniqueId: number, projectId: number, moduleId: number): Observable<TestCaseDefinition[]> {
    return this.http.get<TestCaseDefinition[]>(this.releaseMapUrl + "release/getReleasesMap?releaseUniqueId=" + releaseUniqueId + "&projectId=" + projectId + "&moduleId=" + moduleId + "&searchTxt=" + null + "&sortByColumn=" + null + "&ascOrDesc=" + null + "&limit=" + 0 + "&pageNumber=" + 0 + "&startDate=" + null + "&endDate=" + null)
      .pipe(
        tap(users => this.log(`GET Previously Selected Cases For Release`)),
        catchError(this.handleError('getPreviouslySelectedCasesForRelease', []))
      );
  }

  /** Delete All Mapped test cases */

  deleteAllMappedTestCases(project: number, releaseID: number, moduleId: number): Observable<ReleaseMap[]> {
    return this.http.delete<ReleaseMap[]>(this.releaseMapUrl + "release/deleteReleaseMapByReleaseUniqueId?clientProjectId=" + project + "&releasUniqueId=" + releaseID + "&moduleId=" + moduleId)
      .pipe(
        tap(users => this.log(`Delete All Mapped test cases`)),
        catchError(this.handleError('deleteAllMappedTestCases', []))
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
