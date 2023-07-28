import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Module, ModuleItemNode, ModuleTreeInsert } from './module'
import { MessageService } from './message.service';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  private moduleUrl = environment.apiUrl;  // URL to web api

  dataChange = new BehaviorSubject<ModuleItemNode[]>([]);
  get data(): ModuleItemNode[] { return this.dataChange.value; };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  /** GET modules by projectId from the server */
  getModules(clientProjectId: number): Observable<Module[]> {
    let params = new HttpParams();
    params = params.append('clientProjectId', clientProjectId.toString());
    return this.http.get<Module[]>(this.moduleUrl + "modules/getModulesByProjectId", { params: params })
      .pipe(
        tap(modulesByProjectId => this.log(`fetched getModules`)),
        catchError(this.handleError('getModules', []))
      );
  }

  /** GET Module Hierarchy from the server */
  getModuleHierarchy(clientProjectId: number): Observable<Module[]> {
    let params = new HttpParams();
    params = params.append('clientProjectId', clientProjectId.toString());
    return this.http.get<Module[]>(this.moduleUrl + "modules/getModulesHierarchy", { params: params })
      .pipe(
        tap(moduleHierarchy => this.log(`fetched getModuleHierarchy`)),
        catchError(this.handleError('getModuleHierarchy', []))
      );
  }

  /** GET modules by projectId from the server */
  getModulesTree(clientProjectId: number) {
    let params = new HttpParams();
    params = params.append('clientProjectId', clientProjectId.toString());
    return this.http.get<Module[]>(this.moduleUrl + "modules/getModuleTree", { params: params })
      .pipe(
        tap(moduleTree => this.dataChange.next(this.buildModuleTree(moduleTree, 0))),
        catchError(this.handleError('getModulesTree', []))
      );
  }

  /** PUT: update a new module to the server */
  updateModuleTree(node: ModuleItemNode, name: string, clientOrganization: string, clientProjectId: number, userName: string): Observable<Module[]> {
    let newNode, children, index, parentModuleId, newModuleName;
    if (node.parent != undefined) {
      newNode = new ModuleItemNode(name, 0, 0, node.children.value, node.parent);
      children = node.parent.children.value;
      index = children.indexOf(node);
      children.splice(index, 1, newNode);
      node.parent.children.next(children);
      parentModuleId = node.parent.itemId;
      newModuleName = newNode.item;
    } else {
      parentModuleId = 0;
      newModuleName = name;
    }
    const moduleTreeInsertObj = new ModuleTreeInsert();
    moduleTreeInsertObj.projectId = clientProjectId;
    moduleTreeInsertObj.clientOrganization = clientOrganization;
    moduleTreeInsertObj.parentModuleId = parentModuleId;
    moduleTreeInsertObj.newModuleName = newModuleName;
    moduleTreeInsertObj.userName = userName;
    return this.http.patch<Module[]>(this.moduleUrl + "modules/updateModuleTree", moduleTreeInsertObj, httpOptions)
      .pipe(
        tap(moduleTree => this.dataChange.next(this.buildModuleTree(moduleTree, 0))),
        catchError(this.handleError<Module[]>('updateModuleTree'))
      );
  }
  /**
   * Build the file structure tree. The `value` is the Json Array.
   * The return value is the list of `ModuleItemNode`.
   */
  buildModuleTree(modules: Module[], level: number): ModuleItemNode[] {
    return modules.reduce<ModuleItemNode[]>((accumulator, key) => {
      const value = key['children'];
      const node = new ModuleItemNode(key['name'], key['moduleId'], key['moduleParentId']);
      if (value.length > 0) {
        node.children = new BehaviorSubject(this.buildModuleTree(value, level + 1));
      }
      return accumulator.concat(node);
    }, []);
  }



  /** Add an item to to-do list */
  insertNode(parent: ModuleItemNode, name: string) {
    const child = new ModuleItemNode(name, 0, 0, [], parent);
    const children = parent.children.value;
    children.push(child);
    parent.children.next(children);
    this.dataChange.next(this.data);
  }

  /** PUT: update a new module to the server */
  updateModuleDetail(node: ModuleItemNode, name: string, clientOrganization: string, clientProjectId: number, userName: string): Observable<Module[]> {

    const moduleTreeInsertObj = new Module();
    moduleTreeInsertObj.clientProjectsId = clientProjectId;
    moduleTreeInsertObj.name = name;
    moduleTreeInsertObj.createdBy = userName;
    moduleTreeInsertObj.moduleId = node.itemId
    moduleTreeInsertObj.moduleParentId = node.itemParentId;
    return this.http.patch<Module[]>(this.moduleUrl + "modules/updateModulesById", moduleTreeInsertObj, httpOptions)
      .pipe(
        // tap(moduleTree => this.dataChange.next(this.buildModuleTree(moduleTree, 0))),
        // catchError(this.handleError<Module[]>('updateModuleTree'))
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
    this.messageService.add('ModuleService: ' + message);
  }

}
