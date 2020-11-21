import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  // //GET
  //   get(){
  //     return this.http.get(environment.BASE_URL+'/Articulo');
  //   }

  /* GET */
  get<T>(url: string, httpParams?: any): Observable<HttpResponse<T>> {
    const httpHeaders: HttpHeaders = this.getHeaders();
    return this.http.get<T>(url,
      {
        headers: httpHeaders,
        params: httpParams,
        observe: 'response'
      });
  }


  /* POST */
  post<T>(url: string, data: any): Observable<HttpResponse<T>> {
    const httpHeaders: HttpHeaders = this.getHeaders();

    return this.http.post<T>(url, data,
      {
        headers: httpHeaders,
        observe: 'response'
      });
  }

  /* DEL */
  delete<T>(url: string, params?: any): Observable<HttpResponse<T>> {
    const httpHeaders: HttpHeaders = this.getHeaders();

    return this.http.delete<T>(url,
      {
        headers: httpHeaders,
        observe: 'response'
      });
  }

    /* PUT */
    put<T>(url: string, data: any): Observable<HttpResponse<T>> {
      const httpHeaders: HttpHeaders = this.getHeaders();
  
      return this.http.put<T>(url, data,
        {
          headers: httpHeaders,
          observe: 'response'
        });
    }


  getHeaders(): HttpHeaders {
    let httpHeaders: HttpHeaders = new HttpHeaders();
    return httpHeaders;
  }
}
