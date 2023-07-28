import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { UsersDetail } from './user';
import { UserAllDetail } from './user';
import { AllGroupsInfo } from './all-group';
import { AssingUser } from './user';
import { MessageService } from './message.service';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userInfoUrl = environment.apiUrl;  // URL to web api
  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }


  /** GET all users from the server */
  /** GET test case definitions from the server */
  getAllUsers(value: string): Observable<UsersDetail[]> {
    return this.http.get<UsersDetail[]>(this.userInfoUrl + "users/getUserList?group=" + value)
      .pipe(
        tap(users => this.log(`fetched all users`)),
        catchError(this.handleError('getAllUsers', []))
      );
  }

  
   /** POST: assing asset Info definition to the server */
   assingAssetToUser(assetinfo: AssingUser): Observable<AssingUser> {
    return this.http.post<AssingUser>(this.userInfoUrl + "/AssetUser/addAssetUser", assetinfo, httpOptions)
      .pipe(
        tap((assetinfo: AssingUser) => this.log('assing asset Info')),
        catchError(this.handleError<AssingUser>('assingAssetToUser'))
      );
  }


  /** GET all assinged asset for particular user */
 
  getAssignedAssetsForUser(value: string): Observable<AssingUser[]> {
    return this.http.get<AssingUser[]>(this.userInfoUrl + "AssetUser/getAssetUserDetails/" + value + "/")
      .pipe(
        tap(users => this.log(`fetched all users`)),
        catchError(this.handleError('getAssignedAssetsForUser', []))
      );
  }

   /** GET All list of user that have a asset assigned */
   getAllAssetUsers(): Observable<AssingUser[]> {
    return this.http.get<AssingUser[]>(this.userInfoUrl + "/AssetUser/getAssetUserList")
      .pipe(
        tap(AssetTypeDefinitions => this.log(`fetced all asset users info`)),
        catchError(this.handleError('getAllAssetUsers', []))
      );
    }

    
  /** GET all groups info */
  getAllGroups(): Observable<AllGroupsInfo[]> {
    return this.http.get<AllGroupsInfo[]>(this.userInfoUrl + "/users/getGroups")
      .pipe(
        tap(users => this.log(`fetched all groups`)),
        catchError(this.handleError('getAllGroups', []))
      );
  }

    /** GET particular user Detail */
    getUserDetailForName(value: string): Observable<UserAllDetail[]> {
      return this.http.get<UserAllDetail[]>(this.userInfoUrl + "/users/getUserDetailByID?userID=" + value)
        .pipe(
          tap(users => this.log(`fetched particular user Details`)),
          catchError(this.handleError('getUserDetailForName', []))
        );
    }

    /** GET particular user Contact Detail */
    getUserContactDetailForName(value: string): Observable<UserAllDetail[]> {
      return this.http.get<UserAllDetail[]>(this.userInfoUrl + "/users/getContactDetailByID?userID=" + value)
        .pipe(
          tap(users => this.log(`fetched particular user contact Details`)),
          catchError(this.handleError('getUserContactDetailForName', []))
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
