import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { MessageService } from './message.service';
import { environment } from '../../environments/environment';
import { ScenarioEdit } from './feature-scenario';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class FeatureEditService {
  private testMapUrl = environment.apiUrl;  // URL to web api
  constructor(private http: HttpClient,
    private messageService: MessageService) { }

  /** GET scenarios of a feature file Diff*/

  getAllScenarioWithStepsDiff(featureName: string, clientOrganization: string, clientProjectId: number): Observable<any> {
    return this.http.get<any>(this.testMapUrl + "featureManagement/getFeatureFileVersions?clientProjectId=" + clientProjectId + "&featureName=" + featureName)
      .pipe(
        tap(users => this.log(`fetched scenarios of a feature file diff`)),
        catchError(this.handleError('getAllScenarioWithStepsDiff', []))
      );
  }

  /** GET scenarios of a feature file */

  getAllScenarioWithSteps(featureName: string, clientOrganization: string, clientProjectId: number): Observable<ScenarioEdit[]> {
    let params = new HttpParams();
    params = params.append('clientOrganization', clientOrganization);
    params = params.append('clientProjectId', clientProjectId.toString());
    params = params.append('featureName', featureName);
    return this.http.get<ScenarioEdit[]>(this.testMapUrl + "featureManagement/getEntireFeature", { params: params })
      .pipe(
        tap(users => this.log(`fetched scenarios of a feature file`)),
        catchError(this.handleError('getScenariosOfFeature', []))
      );
  }


  /** PUT: update feature file */
  updateFeatureFile(editedFeatureFile: ScenarioEdit[], featureName: string, clientOrganization: string, clientProjectId: number): Observable<ScenarioEdit> {
    return this.http.patch<ScenarioEdit>(this.testMapUrl + "featureManagement/updateFeature?clientOrganization=" + clientOrganization + "&clientProjectId=" + clientProjectId, editedFeatureFile, httpOptions)
      .pipe(
        tap(users => this.log(`update feature file`)),
        catchError(this.handleError<ScenarioEdit>('updateFeatureFile'))
      );
  }

  /** GET: download the Feature File*/

  downloadFeatureFile(featureName: string, clientOrganization: string, clientProjectId: number, path: string) {
    return this.http.get(this.testMapUrl + "featureManagement/downloadFeatureFile?clientOrganization=" + clientOrganization + "&clientProjectId=" + clientProjectId + "&featureName=" + featureName + "&reportFilePath=" + path, {
      responseType: "text"
    }).pipe(
      tap(users => this.log(`download the Feature File`)),
      catchError(this.handleError<ScenarioEdit>('downloadFeatureFile'))
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
