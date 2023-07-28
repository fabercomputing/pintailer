import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';

import { Observable, Subject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ClientProject } from './client-project';
import { MessageService } from './message.service';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ClientProjectService {

  private clientProjectUrl = environment.apiUrl;  // URL to web api
  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  /** GET client projects from the server */
  getClientProjects(): Observable<ClientProject[]> {
    return this.http.get<ClientProject[]>(this.clientProjectUrl + "clientProject/getAssignedClientProjectsForDefaultOrg")
      .pipe(
        tap(clientProjects => this.log(`fetched clientProjects`)),
        catchError(this.handleError('getAssignedClientProjectsForDefaultOrg', []))
      );
  }

  /** GET client projects from the server for given organization*/
  getAllClientProjectsForDefaultOrg(): Observable<ClientProject[]> {
    return this.http.get<ClientProject[]>(this.clientProjectUrl + "clientProject/getAllClientProjectsForDefaultOrg")
      .pipe(
        tap(clientProjects => this.log(`fetched clientProjects`)),
        catchError(this.handleError('getClientProjectsForGivenOrg', []))
      );
  }

  /** GET client projects from the server for given organization*/
  getAllClientProjectsForGivenOrg(orgName: string): Observable<ClientProject[]> {
    return this.http.get<ClientProject[]>(this.clientProjectUrl + "clientProject/getAllClientProjectsForGivenOrg?organizationName=" + orgName)
      .pipe(
        tap(clientProjects => this.log(`fetched clientProjects`)),
        catchError(this.handleError('getClientProjectsForGivenOrg', []))
      );
  }

  /** POST: add a client project to the server */
  addClientProject(clientProject: ClientProject): Observable<ClientProject> {
    return this.http.post<ClientProject>(this.clientProjectUrl + "clientProject/addClientProject", clientProject, httpOptions)
      .pipe(
        tap((clientProject: ClientProject) => this.log(`added client project w/ project name=${clientProject.name}`)),
        catchError(this.handleError<ClientProject>('addClientProject'))
      );
  }

  /** PUT: update a client project to the server */
  updateClientProject(clientProject: ClientProject): Observable<ClientProject> {
    return this.http.patch<ClientProject>(this.clientProjectUrl + "clientProject/updateClientProject", clientProject, httpOptions)
      .pipe(
        tap((clientProject: ClientProject) => this.log(`updated client project w/ project name=${clientProject.name}`)),
        catchError(this.handleError<ClientProject>('updateClientProject'))
      );
  }

  /** DELETE: add a client project to the server */
  deleteClientProject(clientProject: ClientProject): Observable<ClientProject> {
    const id = typeof clientProject === 'number' ? clientProject : clientProject.clientProjectId;
    const url = this.clientProjectUrl + `clientProject/deleteClientProject/${id}`;
    return this.http.delete<ClientProject>(url, httpOptions)
      .pipe(
        tap(_ => this.log(`deleted ClientProject id=${id}`)),
        catchError(this.handleError<ClientProject>('deleteClientProject'))
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
