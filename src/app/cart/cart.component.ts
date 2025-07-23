import { Component, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { UserService } from '../services/user.service';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../services/cart.service';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  isLoggedIn = false;
  userRole: string = '';
  userId: string = '';
  cart: any[] = [];

  constructor(
    private userService: UserService,
    private httpClient: HttpClient,
    private cartService: CartService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    this.isLoggedIn = !!token;

    if (token) {
      const decodedToken: any = jwtDecode(token);
      this.userRole = decodedToken.role;

      this.userService.getUserProfile().subscribe({
        next: (profile) => {
          this.userRole = profile.role;
          this.userId = profile.id;
          console.log('User id ' + this.userId);
          this.fetchCart();
        },
        error: (err) => {
          console.error('Failed to load profile', err);
        },
      });
    }
  }

  fetchCart() {
    this.httpClient
      .get<any[]>(`http://localhost:8090/cart/${this.userId}`)
      .subscribe({
        next: (cartItems) => {
          // For each cart item, fetch dish details
          const dishRequests = cartItems.map((item) =>
            this.httpClient.get<any>(
              `http://localhost:8090/v1/dish/${item.dishId}`
            )
          );

          forkJoin(dishRequests).subscribe({
            next: (dishDetails) => {
              // Merge dish details into cart items
              this.cart = cartItems.map((item, index) => ({
                ...item,
                dishDetails: dishDetails[index],
              }));

            },
            error: (err) => {
              console.error('Error fetching dish details:', err);
            },
          });
        },
        error: (err) => {
          console.error('Error while fetching Cart', err);
        },
      });
  }

  increaseQuantity(item: any) {
    this.cartService.addItemToCart(item.dishId, this.userId).subscribe({
      next: () => {
        item.quantity += 1;
        this.toastrService.success("Item added successfully!", 'Success');
        console.log(`${item.dishName} quantity increased.`);
      },
      error: (err) => {
        console.error('Error placing order:', err);

        const errorMsg = err?.error?.message || 'An unexpected error occurred';

        this.toastrService.error(errorMsg, 'Error');
      },
    });
  }

  decreaseQuantity(item: any) {
    if (item.quantity > 1) {
      this.cartService.decrementCartItem(item.dishId, this.userId).subscribe({
        next: () => {
          item.quantity -= 1;
          this.toastrService.success('Item removed successfully!', 'Success');
          console.log(`${item.dishName} quantity decreased.`);
        },
        error: (err) => console.error('Error updating quantity:', err),
      });
    } else {
      this.cartService.decrementCartItem(item.dishId, this.userId).subscribe({
        next: () => {
          this.cart = this.cart.filter(
            (cartItem) => cartItem.dishId !== item.dishId
          );
          this.toastrService.success('Item removed successfully!', 'Success');
          console.log(`${item.dishName} removed from cart.`);
        },
        error: (err) => console.error('Error removing item:', err),
      });
    }
  }

  getTotalAmount(): number {
    return this.cart.reduce((total, item) => {
      return total + item.dishDetails.price * item.quantity;
    }, 0);
  }

  placeOrder() {
    if (this.cart.length === 0) {
      console.warn('Cart is empty. Cannot place order.');
      return;
    }

    const dishes: string[] = [];
    this.cart.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        dishes.push(item.dishId);
      }
    });

    const restaurantId = this.cart[0].dishDetails.restaurantId;

    const orderPayload = {
      userId: this.userId,
      restaurantId: restaurantId,
      amount: this.getTotalAmount(),
      dishes: dishes,
    };


    this.httpClient
      .post('http://localhost:8090/v1/order/create', orderPayload)
      .subscribe({
        next: (response) => {
          this.toastrService.success('Order placed successfully!', 'Success');
          this.cart = [];
          this.deleteCart();
        },
        error: (err) => {
          console.error('Error placing order:', err);
        },
      });
  }
  deleteCart() {
    this.httpClient
      .delete(`http://localhost:8090/cart/clear/${this.userId}`)
      .subscribe({
        next: () => {
          console.log('Cart cleared successfully.');
        },
        error: (err) => {
          console.error('Error clearing cart:', err);
        },
      });
  }
}
