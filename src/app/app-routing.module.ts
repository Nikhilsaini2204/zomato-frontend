import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { ProfileComponent } from './profile/profile.component';
import { CategorydetailComponent } from './homepage/homecategory/categorydetail/categorydetail.component';
import { RestaurantComponent } from './homepage/restaurant/restaurant.component';
import { RequestComponent } from './request/request.component';
import { AdminGuard } from './auth/admin.guard';
import { RestaurantmanageComponent } from './restaurantmanage/restaurantmanage.component';
import { CartComponent } from './cart/cart.component';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'category/:name', component: CategorydetailComponent },
  { path: 'restaurant/:name', component: RestaurantComponent },
  {
    path: 'requests',
    component: RequestComponent,
    canActivate: [AdminGuard],
  },
  {path:'managerestaurant', component:RestaurantmanageComponent},
  {path:'cart', component:CartComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
