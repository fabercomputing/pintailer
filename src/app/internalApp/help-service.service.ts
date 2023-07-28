import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Help, HelpItemNode, HelpDetail } from './help'
import { MessageService } from './message.service';
import { MailData } from './mail-data';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class HelpServiceService {
  private helpUrl = environment.apiUrl;  // URL to web api

  dataChange = new BehaviorSubject<HelpItemNode[]>([]);
  get data(): HelpItemNode[] { return this.dataChange.value; };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  /** GET modules by projectId from the server */
  getHelpTree() {
    return this.http.get<Help[]>(this.helpUrl + "HelpTopics/getHelpTopicsHierarchy")
      .pipe(
        tap(helpTree => this.dataChange.next(this.buildModuleTree(helpTree, 0))),
        catchError(this.handleError('getHelpTree', []))
      );
  }

  /**
 * Build the file structure tree. The `value` is the Json Array.
 * The return value is the list of `ModuleItemNode`.
 */
  buildModuleTree(modules: Help[], level: number): HelpItemNode[] {
    return modules.reduce<HelpItemNode[]>((accumulator, key) => {
      const value = key['children'];
      const node = new HelpItemNode(key['title'], key['topicId']);
      if (value.length > 0) {
        node.children = new BehaviorSubject(this.buildModuleTree(value, level + 1));
      }
      return accumulator.concat(node);
    }, []);
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
    this.messageService.add('HelpServiceService: ' + message);
  }

  /** POST: send support mail */
  sendSupportMail(supportType: string, visitorName: string, visitorEmail: string, visitorCompanyName: string, visitorContactNo: string, remarks: string, gcaptha: string) {

    if (window.location.hostname === "localhost") {
      this.helpUrl = "http://" + window.location.hostname + ":8080/fwTestManagement/public/";  // URL to web api
    } else {
      this.helpUrl = "http://" + window.location.hostname + ":8080/fwTestManagement/public/";  // URL to web api
    }

    return this.http.post(this.helpUrl + "/email/sendEmail?supportType=" + supportType + "&visitorName=" + visitorName + "&visitorEmail=" + visitorEmail + "&visitorCompanyName=" + visitorCompanyName + "&visitorContactNo=" + visitorContactNo + "&remarks=" + remarks + "&gcaptha=" + gcaptha, httpOptions)
      .pipe(
        tap(users => this.log(`send support mail`)),
        catchError(this.handleError('sendSupportMail'))
      );
  }


  /** POST: send support mail */
  saveSupportMail(mailData: MailData) {

    if (window.location.hostname === "localhost") {
      this.helpUrl = "http://" + window.location.hostname + ":8080/fwTestManagement/public/";  // URL to web api
    } else {
      this.helpUrl = "http://" + window.location.hostname + ":8080/fwTestManagement/public/";  // URL to web api
    }

    return this.http.post(this.helpUrl + "/notifications/addNotifications", mailData, httpOptions)
      .pipe(
        tap(users => this.log(`send support mail`)),
        catchError(this.handleError('sendSupportMail'))
      );
  }

  /** POST: send support mail */
  saveSupportMailNew(gcaptha: string, mailData: MailData) {

    if (window.location.hostname === "localhost") {
      this.helpUrl = "http://" + window.location.hostname + ":8080/fwTestManagement/public/";  // URL to web api
    } else {
      this.helpUrl = "http://" + window.location.hostname + ":8080/fwTestManagement/public/";  // URL to web api
    }

    return this.http.post(this.helpUrl + "/notifications/addNotifications?gcaptha=" + gcaptha, mailData, httpOptions)
      .pipe(
        tap(users => this.log(`send support mail`)),
        catchError(this.handleError('sendSupportMail'))
      );
  }

  /** GET all notifications */
  getAllNotifications(): Observable<MailData[]> {
    return this.http.get<MailData[]>(this.helpUrl + "/notifications/getAllNotifications")
      .pipe(
        tap(getAllNotifications => this.log(`GET all notifications`)),
        catchError(this.handleError('getAllNotifications', []))
      );
  }

  /** GET help detail from topic ID */
  getHelpDetails(): Observable<HelpDetail[]> {
    return this.http.get<HelpDetail[]>(this.helpUrl + "HelpDetails/getHelpDetailsList")
      .pipe(
        tap(getHelpDetails => this.log(`GET help detail from topic ID`)),
        catchError(this.handleError('getHelpDetails', []))
      );
  }

  /** GET help detail from help detail ID */
  getHelpDetailForId(helpId: number): Observable<HelpDetail> {
    return this.http.get<HelpDetail>(this.helpUrl + "/HelpDetails/getHelpDetailsForTopicById?topicId=" + helpId)
      .pipe(
        tap(users => this.log(`help detail from help detail ID`)),
        catchError(this.handleError<HelpDetail>('getHelpDetailForId'))
      );
  }


}
