import { Component, OnInit } from '@angular/core';
import { RestaurantService } from 'src/app/services/restaurant.service';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss'],
})
export class RestaurantsComponent implements OnInit{
  restaurants: any[] = [];

  constructor(private restaurantService: RestaurantService){}

  ngOnInit(): void {
    this.fetchRestaurants();
  }

  fetchRestaurants(){
    this.restaurantService.fetchRestaurants().subscribe({
      next:(res)=>{
        this.restaurants = res;
      },
      error:(err)=>{
        console.error("Error while fetching restaurants", err);
      }
    })
  }
}
