import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { UserLoginDetail } from './user';
import { UserProfileDetail } from './user';
import { MessageService } from './message.service';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private loginUrl = environment.apiUrl;  // URL to web api
  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  /** POST: do login */
  doLogin(gcaptha: string, userLoginDetail: UserLoginDetail): Observable<UserProfileDetail> {

    if (window.location.hostname === "localhost") {
      this.loginUrl = "http://" + window.location.hostname + ":8080/fwTestManagement/public/";  // URL to web api
    } else {
      this.loginUrl = "http://" + window.location.hostname + ":8080/fwTestManagement/public/";  // URL to web api
    }

    return this.http.post<UserProfileDetail>(this.loginUrl + "users/loginUser?gcaptha=" + gcaptha, userLoginDetail, httpOptions)
      .pipe(
        tap((userProfileDetail: UserProfileDetail) => {
          this.log(`login successfully w/ name=${userProfileDetail.userName}`)
          this.setUserInformationInLocalStorage(userProfileDetail);
        }), catchError(this.handleError<UserProfileDetail>('login'))
      );
  }

  /** POST: Change Password */
  updateUserPassword(userName: string, oldPass: string, newPass: string, gcaptha: string) {

    if (window.location.hostname === "localhost") {
      this.loginUrl = "http://" + window.location.hostname + ":8080/fwTestManagement/public/";  // URL to web api
    } else {
      this.loginUrl = "http://" + window.location.hostname + ":8080/fwTestManagement/public/";  // URL to web api
    }

    return this.http.post(this.loginUrl + "users/updateUserPassword?username=" + userName + "&oldPassword=" + oldPass + "&newPassword=" + newPass + "&gcaptha=" + gcaptha, httpOptions, {
      responseType: "text"
    })
      .pipe(
        // tap(users => this.log(`Change Password`)),
        // catchError(this.handleError<UserProfileDetail>('updateUserPassword'))
      );
  }

  /**  // remove user from local storage to log user out */
  logout() {

    localStorage.removeItem('currentUser');

    // return this.http.post("http://" + window.location.hostname + ":8080/fwTestManagement/private/users/logout", httpOptions, {
    //   responseType: "text"
    // })
    //   .pipe(
    //     tap(users => this.log(`logout`)),
    //     catchError(this.handleError<UserProfileDetail>('logout'))
    //   );
  }

  setUserInformationInLocalStorage(userProfileDetail: UserProfileDetail) {
    localStorage.setItem('currentUser', JSON.stringify(userProfileDetail));
  }

  getUserInformationFromLocalStorage(): UserProfileDetail {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token && currentUser.email && currentUser.defaultOrganization && currentUser.employeeNumber && currentUser.uniqueLDAPId && currentUser.userApplicationsAndRoles && currentUser.userName && currentUser.userOrganizations && currentUser.userOrganizationalRole) {
      return currentUser;
    } else {
      return null;
    }

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
    this.messageService.add('LoginService: ' + message);
  }

}
