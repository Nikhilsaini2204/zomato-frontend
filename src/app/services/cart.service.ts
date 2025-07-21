import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(private httpClient: HttpClient) {}

  addItemToCart(dishId: string, userId: string): Observable<any> {
    const body = {
      dishId: dishId,
      userId: userId,
    };

    return this.httpClient.post('http://localhost:8090/cart/add', body);
  }

  decrementCartItem(dishId:string, userId:string):Observable<any>{
    const body = {
      dishId: dishId,
      userId: userId,
    };

    return this.httpClient.post('http://localhost:8090/cart/decrement', body);
  }
}
