import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ReleaseBug } from './bug';
import { MessageService } from './message.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class BugService {

  private bugApiUrl = environment.apiUrl;  // URL to web api
  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  /** POST: attach bug to a Test Case */
  addReleaseBug(projectId: number, ReleaseBug: ReleaseBug): Observable<ReleaseBug> {
    return this.http.post<ReleaseBug>(this.bugApiUrl + "/releaseTestCaseBug/addReleaseTestCaseBug?clientProjectId=" + projectId, ReleaseBug, httpOptions)
      .pipe(
        tap((ReleaseBug: ReleaseBug) => this.log("Add Release Bug")),
        catchError(this.handleError<ReleaseBug>('addReleaseBug'))
      );
  }

  /** GET: get bugs attached to a Test Case */
  getAllAttachedBugs(testCaseId: number): Observable<ReleaseBug[]> {
    return this.http.get<ReleaseBug[]>(this.bugApiUrl + "/releaseTestCaseBug/getReleaseTestCaseBugByTestCaseId?testCaseId=" + testCaseId + "&applicable=all&isDeleted=false", httpOptions)
      .pipe(
        tap(() => this.log("Get bugs attached to a Test Case")),
        catchError(this.handleError<ReleaseBug[]>('getAllAttachedBugs'))
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
    this.messageService.add('ClientProjectService: ' + message);
  }
}
