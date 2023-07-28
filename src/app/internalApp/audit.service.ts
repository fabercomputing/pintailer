import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuditInfo } from './audit';
import { MessageService } from './message.service';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private auditInfoUrl = environment.apiUrl;  // URL to web api
  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) { }

  /** GET: get Audit Info */

  getAuditInfo(tableName: string, operationTime: string, operationTimeCondition: string, operation: string): Observable<AuditInfo[]> {
    return this.http.get<AuditInfo[]>(this.auditInfoUrl + "/appAudit/getAuditInfo?tableName=" + tableName + "&operationTime=" + operationTime + "&operationTimeCondition=" + operationTimeCondition + "&operation=" + operation)
      .pipe(
        tap(users => this.log(`getAuditInfo[]`)),
        catchError(this.handleError<AuditInfo[]>('getAuditInfo'))
      );
  }

  /** GET: get Schema Table Names */

  getSchemaTableNames(): Observable<string[]> {
    return this.http.get<string[]>(this.auditInfoUrl + "/appAudit/getSchemaTableNames?schemaName=fw_test_mgmt")
      .pipe(
        tap(users => this.log(`getSchemaTableNames[]`)),
        catchError(this.handleError<string[]>('getSchemaTableNames'))
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
