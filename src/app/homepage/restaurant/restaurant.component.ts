import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from 'src/app/services/cart.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss'],
})
export class RestaurantComponent {
  restaurantName!: string;
  restaurantDetails: any;
  categoryName: string = '';
  restaurantCategories: any[] = [];
  selectedCategory: any;
  dishes: any[] = [];
  selectedDish: any = null;
  userId:string = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private cartService: CartService, private userService: UserService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.restaurantName = this.route.snapshot.paramMap.get('name')!;

    const params = new HttpParams().set('name', this.restaurantName);
    this.http
      .get(`http://localhost:8090/v1/restaurant/name`, { params })
      .subscribe((data: any) => {
        this.restaurantDetails = data;
      });

    const params1 = new HttpParams().set('restaurantName', this.restaurantName);
    this.http
      .get<any[]>(`http://localhost:8090/v1/dish/categories/by-restaurant`, {
        params: params1,
      })
      .subscribe((categories: any[]) => {
        this.restaurantCategories = categories;
        if (categories.length > 0) {
          this.selectedCategory = categories[0];
          this.categoryName = categories[0].name;
          this.fetchDishes();
        }
      });
  }

  openDishOverlay(dish: any) {
    this.selectedDish = dish;
  }

  closeDishOverlay() {
    this.selectedDish = null;
  }

  fetchDishes() {
    const dishParams = new HttpParams()
      .set('restaurantName', this.restaurantName)
      .set('categoryName', this.categoryName);

    this.http
      .get<any[]>('http://localhost:8090/v1/category/dishes/restCat', {
        params: dishParams,
      })
      .subscribe({
        next: (data) => {
          this.dishes = data;
        },
        error: (error) => {
          console.error('Error fetching dishes', error);
        },
      });
  }

  selectCategory(category: any) {
    this.selectedCategory = category;
    this.categoryName = category.name;
    this.fetchDishes();
  }

  addToCart(dish: any) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('⚠️ You must log in to add items to cart.');
      return;
    }

    console.log('Dish ID:', dish.id);

    this.userService.getUserProfile().subscribe({
      next: (res) => {
        const userId = res.id; 
        console.log(userId);
        this.cartService.addItemToCart(dish.id, userId).subscribe({
          next: () => {
            this.toastr.success('Item added successfully!', 'Success');
          },
          error: (err) => {
            console.error(' Failed to add to cart:', err);
          },
        });
      },
      error: (err) => {
        console.error('Error fetching user profile', err);
      },
    });
  }
}
