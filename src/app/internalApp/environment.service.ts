import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { MessageService } from './message.service';
import { environment } from '../../environments/environment';
import { Environment } from "./environment";

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private environmentMapUrl = environment.apiUrl;  // URL to web api
  constructor(private http: HttpClient,
    private messageService: MessageService) { }

  /** GET all environment info */

  getAllEnvironmentInfo(): Observable<Environment[]> {
    return this.http.get<Environment[]>(this.environmentMapUrl + "/executionEnv/getAllExecutionEnv")
      .pipe(
        tap(users => this.log(`GET all environment info`)),
        catchError(this.handleError('getAllEnvironmentInfo', []))
      );
  }

  /** POST: Add Environment */
  addNewEnvironment(environmentInfo: Environment): Observable<Environment[]> {
    return this.http.post<Environment[]>(this.environmentMapUrl + "/executionEnv/addExecutionEnv", environmentInfo, httpOptions)
      .pipe(
        tap(res => this.log(`Add Environment`)),
        catchError(this.handleError('addNewEnvironment', []))
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
