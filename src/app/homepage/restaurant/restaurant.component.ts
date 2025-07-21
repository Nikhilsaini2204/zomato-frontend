import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

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
          console.log('Fetched dishes:', this.dishes);
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
    console.log('Added to cart:', dish);
    // You can also push to a cart array if you’re tracking selected items:
    // this.cart.push(dish);
  }
}
