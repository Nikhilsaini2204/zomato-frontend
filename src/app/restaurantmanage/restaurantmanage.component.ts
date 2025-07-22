import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-restaurantmanage',
  templateUrl: './restaurantmanage.component.html',
  styleUrls: ['./restaurantmanage.component.scss'],
})
export class RestaurantmanageComponent implements OnInit {
  restaurant: any;
  showAddItem = false;
  addItemForm!: FormGroup;
  realCategories: any;
  restaurantName: string = '';
  showCategory = false;
  addCategoryForm!: FormGroup;
  restaurantId:string = "";
  showOrders = false;
  dishes: any[] = [];
  orders: any[] = [];

  constructor(
    private userService: UserService,
    private httpClient: HttpClient,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.fetchRestaurant();
    this.initializeAddItemForm();
    this.initializeAddCategoryForm();
  }

  fetchOrders() {
    if (!this.restaurant?.id) {
      console.error('Restaurant ID is missing. Cannot fetch orders.');
      return;
    }
    const params = new HttpParams().set('restaurantId', this.restaurant.id);
    this.httpClient
      .get<any[]>(`http://localhost:8090/v1/order/restaurant`, { params })
      .subscribe({
        next: (res) => {
          this.orders = res;
        },
        error: (err) => {
          console.error('Error fetching orders:', err);
        },
      });
  }

  fetchDishes() {
    const params = new HttpParams().set('name', this.restaurantName);
    this.httpClient
      .get<any[]>('http://localhost:8090/v1/dish/restaurant', {
        params,
      })
      .subscribe({
        next: (res) => {
          this.dishes = res;
        },
        error: (err) => {
          console.error('Error fetching dishes', err);
        },
      });
  }

  fetchRestaurant() {
    this.userService.getUserProfile().subscribe({
      next: (user) => {
        const ownerId = user.id;
        const apiUrl = `http://localhost:8090/v1/restaurant/owner?ownerId=${ownerId}`;
        this.httpClient.get(apiUrl).subscribe({
          next: (res: any) => {
            this.restaurant = res;
            this.restaurantId = res.id;
            this.restaurantName = res.name;
            this.fetchCategories();
            this.fetchDishes();
          },
          error: (err) => {
            console.error('Error fetching restaurant:', err);
          },
        });
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
      },
    });
  }

  fetchCategories() {
    if (!this.restaurantName) {
      console.error('Restaurant name not set. Cannot fetch categories.');
      return;
    }

    const params1 = new HttpParams().set('restaurantName', this.restaurantName);
    this.httpClient
      .get<any[]>(`http://localhost:8090/v1/dish/categories/by-restaurant`, {
        params: params1,
      })
      .subscribe({
        next: (categories: any[]) => {
          this.realCategories = categories;
        },
        error: (err) => {
          console.error('Error fetching categories:', err);
        },
      });
  }

  initializeAddCategoryForm() {
    this.addCategoryForm = this.fb.group({
      name: ['', Validators.required],
      categoryImg: ['', Validators.required],
    });
  }

  initializeAddItemForm() {
    this.addItemForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      prepTime: [''],
      dailyCap: ['', Validators.required],
      available: [true, Validators.required],
      category: ['', Validators.required],
    });
  }

  openAddItem() {
    this.showAddItem = true;
  }
  openCategory() {
    this.showCategory = true;
  }
  closeCategory() {
    this.showCategory = false;
  }
  closeAddItem() {
    this.showAddItem = false;
  }
  openOrders() {
    this.showOrders = true;
    this.fetchOrders(); 
  }

  closeOrders() {
    this.showOrders = false;
  }

  submitItem() {
    if (!this.restaurant || !this.restaurant.id) {
      console.error('Restaurant ID is missing. Cannot add item.');
      return;
    }

    if (this.addItemForm.valid) {
      const formData = this.addItemForm.value;

      const categoryId = this.addItemForm.value.category;

      const addItemPayload = {
        name: formData.name,
        description: formData.description,
        image: formData.imageUrl,
        price: formData.price,
        prepTime: formData.prepTime,
        dailyCapacity: formData.dailyCap,
        available: formData.available,
      };

      this.httpClient
        .post(
          `http://localhost:8090/v1/dish/restaurant/${this.restaurantId}/${categoryId}/addItem`,
          addItemPayload
        )
        .subscribe({
          next: (res) => {
            this.closeAddItem();
          },
          error: (err) => {
            console.error('Error creating item:', err);
          },
        });
    } else {
      this.addItemForm.markAllAsTouched();
    }
  }

  submitCategory() {
    if (!this.restaurant || !this.restaurant.id) {
      console.error('Restaurant ID is missing. Cannot add category.');
      return;
    }

    if (this.addCategoryForm.valid) {
      console.log('Category Data: ', this.addCategoryForm.value);

      const addCategoryData = {
        ...this.addCategoryForm.value,
        type: 'CUSTOM',
      };

      this.httpClient
        .post(
          `http://localhost:8090/v1/category/${this.restaurant.id}/create`,
          addCategoryData
        )
        .subscribe({
          next: (res) => {
            console.log('Category created successfully:', res);
            this.fetchCategories();
            this.closeCategory();
          },
          error: (err) => {
            console.error('Error creating category:', err);
          },
        });
    } else {
      this.addCategoryForm.markAllAsTouched();
    }
  }
}
