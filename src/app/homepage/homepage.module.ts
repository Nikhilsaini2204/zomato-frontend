import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomepageComponent } from './homepage.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { HomecategoryComponent } from './homecategory/homecategory.component';
import { CategorydetailComponent } from './homecategory/categorydetail/categorydetail.component';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { RestaurantsComponent } from './restaurants/restaurants.component';

@NgModule({
  declarations: [HomepageComponent, NavbarComponent, HomecategoryComponent, CategorydetailComponent, RestaurantComponent, RestaurantsComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule,
    BrowserAnimationsModule,
  ],
  exports: [NavbarComponent]
})
export class HomepageModule {}
