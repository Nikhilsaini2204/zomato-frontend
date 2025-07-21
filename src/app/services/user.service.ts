import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://localhost:8090';

  constructor(private httpClient: HttpClient) {}

  createUser(data: any): Observable<any> {
    return this.httpClient.post('http://localhost:8090/v1/user/create', data);
  }

  getUserProfile(): Observable<any> {
    const token = localStorage.getItem('authToken');
    return this.httpClient.get('http://localhost:8090/v1/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }


  addRestaurant(restaurantData: any): Observable<any> {
    return this.httpClient.post(
      'http://localhost:8090/v1/restaurant/create',
      restaurantData
    );
  }

  changeRole(id: string): Observable<any> {
    const params = new HttpParams().set('userId', id);
    return this.httpClient.post(
      'http://localhost:8090/v1/user/owner',
      {},
      { params }
    );
  }
}
