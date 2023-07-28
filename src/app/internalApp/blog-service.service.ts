import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogServiceService {

  constructor(private http: HttpClient) { }

  public getJSON(pageName: string): Observable<any> {

    return this.http.get("/assets/json/" + pageName + ".json")

  }
}
