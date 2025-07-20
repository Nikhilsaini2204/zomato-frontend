import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    console.log('AdminGuard check...');
    if (this.authService.hasToken() && this.authService.isAdmin()) {
      console.log('Access granted');
      return true;
    } else {
      console.log('Access denied');
      this.router.navigate(['/']);
      return false;
    }
  }
}
