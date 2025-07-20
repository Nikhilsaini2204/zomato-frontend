import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { ProfileComponent } from './profile/profile.component';
import { CategorydetailComponent } from './homepage/homecategory/categorydetail/categorydetail.component';
import { RestaurantComponent } from './homepage/restaurant/restaurant.component';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'category/:name', component: CategorydetailComponent },
  { path: 'restaurant/:name', component: RestaurantComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
