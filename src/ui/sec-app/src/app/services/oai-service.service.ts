import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { OaiResponse } from '../models/oai-response';

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class OaiService {

  private baseUrl = 'http://127.0.0.1:8000/api';
  private oaiUrl = `${this.baseUrl}/answer`;
  private fileUploadUrl = `${this.baseUrl}/upload`;
  private cmdMsgUrl = `${this.baseUrl}/cmd-msg`;

  constructor(
    private http: HttpClient
  ) {
    window.OaiService = this;
  }

  getAnswer(type: string, question: string): Observable<OaiResponse> {
    let url = `${this.oaiUrl}?type=${type}&msg=${question}`;
    // url += '&dummy=true';
    return this.http.get<OaiResponse>(url)
      .pipe(
        catchError(this.handleError<OaiResponse>('getAnswer', new OaiResponse()))
      );
  }

  upload(file: File): Observable<any> {
  
    // Create form data
    const formData = new FormData(); 
      
    // Store form name as "file" with file data
    formData.append("file", file, file.name);
    // Make http post request over api
    // with formData as req
    return this.http.post(this.fileUploadUrl, formData)
      .pipe(
        catchError(this.handleError<OaiResponse>('getAnswer', new OaiResponse()))
      );
    }

  sendCommandMessage(args: string): Observable<any> {
    console.log(args);
    let req = { args };
    return this.http.post(this.cmdMsgUrl, req)
      .pipe(
        catchError(this.handleError('sendCommandMessage', {}))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
  
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
  
      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
  
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
