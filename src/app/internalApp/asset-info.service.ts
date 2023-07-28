import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AssetType } from './asset-type';
import { AssetInfo } from './asset-info';
import { AssingUser } from './user';
import { MessageService } from './message.service';

import { environment } from '../../environments/environment';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AssetInfoService {
  private assetInfoUrl = environment.apiUrl;  // URL to web api
  constructor(private http: HttpClient,
    private messageService: MessageService) { }

  /** POST: add a new Asset Type definition to the server */
  addAssetType(assetType: AssetType): Observable<AssetType> {
    return this.http.post<AssetType>(this.assetInfoUrl + "AssetType/addAssetType", assetType, httpOptions)
      .pipe(
        tap((assetType: AssetType) => this.log('added assetType ')),
        catchError(this.handleError<AssetType>('addAssetType'))
      );
  }

  /** GET Asset Type definitions from the server */
  getAssetTypeDefinitions(): Observable<AssetType[]> {
    return this.http.get<AssetType[]>(this.assetInfoUrl + "AssetType/getAssetTypeList")
      .pipe(
        tap(AssetTypeDefinitions => this.log(`fetched AssetTypeDefinitions`)),
        catchError(this.handleError('getAssetTypeDefinitions', []))
      );
  }

  /** POST: add a new Asset Info definition to the server */
  addAssetInfo(assetinfo: AssetInfo): Observable<AssetInfo> {
    return this.http.post<AssetInfo>(this.assetInfoUrl + "/AssetInfo/addAssetInfo", assetinfo, httpOptions)
      .pipe(
        tap((assetinfo: AssetInfo) => this.log('added assetinfo')),
        catchError(this.handleError<AssetInfo>('addAssetInfo'))
      );
  }

  /** GET All asset info definitions from the server */
  getAllAssetInfo(): Observable<AssetInfo[]> {
    return this.http.get<AssetInfo[]>(this.assetInfoUrl + "/AssetInfo/getAssetInfoList")
      .pipe(
        tap(AssetTypeDefinitions => this.log(`fetched AssetTypeDefinitions`)),
        catchError(this.handleError('getAssetTypeDefinitions', []))
      );
  }

  /** GET particular asser info by ID */

  getAssetInfoForID(value: number): Observable<AssetInfo> {
    return this.http.get<AssetInfo>(this.assetInfoUrl + "/AssetInfo/getAssetInfoDetails/" + value)
      .pipe(
        tap(users => this.log(`fetched all users`)),
        catchError(this.handleError<AssetInfo>('addAssetType'))
      );
  }

  /** PUT: update asset information */
  updateAssetInfo(assetinfo: AssetInfo): Observable<AssetInfo> {
    return this.http.patch<AssetInfo>(this.assetInfoUrl + "/AssetInfo/updateAssetInfoById", assetinfo, httpOptions)
      .pipe(
        tap(users => this.log(`update asset information`)),
        catchError(this.handleError<AssetInfo>('updateAssetInfo'))
      );
  }

  /** PUT: update asset user information */
  updateAssetUser(assetUser: AssingUser): Observable<AssingUser> {
    return this.http.patch<AssingUser>(this.assetInfoUrl + "/AssetUser/updateAssetUserById", assetUser, httpOptions)
      .pipe(
        tap(users => this.log(`update asset user information`)),
        catchError(this.handleError<AssingUser>('updateAssetUser'))
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
