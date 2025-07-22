import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent {
showOrdersOverlay = false;
  orders: any[] = [];
  loadingOrders = false;

  constructor(private userService: UserService, private httpClient: HttpClient) {}

  ngOnInit(): void {}

  openOrdersOverlay() {
    this.showOrdersOverlay = true;
    this.fetchOrders();
  }

  closeOrdersOverlay() {
    this.showOrdersOverlay = false;
  }

  fetchOrders() {
    this.loadingOrders = true;

    this.userService.getUserProfile().subscribe({
      next: (user) => {
        const userId = user.id;
        const params = new HttpParams().set('userId', userId);

        this.httpClient
          .get<any[]>('http://localhost:8090/v1/order/user', { params })
          .subscribe({
            next: (res) => {
              this.orders = res;
              this.loadingOrders = false;
            },
            error: (err) => {
              console.error('Error fetching orders:', err);
              this.loadingOrders = false;
            },
          });
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
        this.loadingOrders = false;
      },
    });
  }
}
