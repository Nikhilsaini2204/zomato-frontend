import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private httpClient: HttpClient) {}

  fetchCategories(): Observable<any> {
    return this.httpClient.get('http://localhost:8090/v1/category');
  }

  fetchRestaurantsByCategory(categoryName: string): Observable<any> {
    return this.httpClient.get(`http://localhost:8090/v1/dish/restaurants/bycategory`, {
      params: { categoryName },
    });
  }
}
