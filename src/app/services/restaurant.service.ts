import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  constructor(private httpClient: HttpClient) { }

  fetchRestaurants():Observable<any>{
    return this.httpClient.get('http://localhost:8090/v1/restaurant/filters');
  }
}
