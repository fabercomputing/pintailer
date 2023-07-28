import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { UserProfileDetail } from './user';
import { MessageService } from './message.service';
import { environment } from '../../environments/environment';
import { OrganizationInfo } from './user';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private userInfoUrl = environment.apiUrl;  // URL to web api
  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  /** GET: getAllAssignedOrg */
  getAllAssignedOrg(userName: string): Observable<OrganizationInfo[]> {
    return this.http.get<OrganizationInfo[]>(this.userInfoUrl + "userManagement/getUserAssignedOrg/?userName=" + userName, httpOptions)
      .pipe(
        tap(OrganizationInfo => this.log(`getAllAssignedOrg`)),
        catchError(this.handleError('getAllAssignedOrg', []))
      );
  }

  /** POST: setDefaultOrg */
  setDefaultOrg(userBean: UserProfileDetail, org: string): Observable<UserProfileDetail[]> {
    return this.http.post<UserProfileDetail[]>(this.userInfoUrl + "userManagement/setDefaultOrg/?org=" + org, userBean, httpOptions)
      .pipe(
        tap(UserProfileDetail => this.log(`setDefaultOrg`)),
        catchError(this.handleError('setDefaultOrg', []))
      );
  }

  /** POST: setDefaultOrg */
  assignUserToProject(org: string, projectList: string, userList: string): Observable<UserProfileDetail[]> {
    return this.http.post<UserProfileDetail[]>(this.userInfoUrl + "userManagement/assignUserToProject/?organizationName=" + org + "&projectList=" + projectList + "&userList=" + userList, httpOptions)
      .pipe(
        tap(UserProfileDetail => this.log(`assignUserToProject`)),
        catchError(this.handleError('assignUserToProject', []))
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
    this.messageService.add('UserService: ' + message);
  }

}
