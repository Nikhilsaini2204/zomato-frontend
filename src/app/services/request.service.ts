import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  constructor(private httpClient: HttpClient) {}

  fetchRequests(): Observable<any> {
    return this.httpClient.get('http://localhost:8090/v1/restaurant/pending');
  }

  approveRequests(params: any): Observable<any> {
    return this.httpClient.post(
      'http://localhost:8090/v1/restaurant/request/approve',
      params
    );
  }

  rejectRequests(params: any): Observable<any> {
    return this.httpClient.post(
      'http://localhost:8090/v1/restaurant/request/reject',
      params
    );
  }
}
