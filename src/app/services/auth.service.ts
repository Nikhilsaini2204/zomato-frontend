import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor() {}

  public hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  login(token: string): void {
    localStorage.setItem('authToken', token);
    this.loggedIn.next(true);
  }

  isAdmin(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    const decoded: any = jwtDecode(token);
    return decoded.role === 'ADMIN';
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.loggedIn.next(false);
  }
}
