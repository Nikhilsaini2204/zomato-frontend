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

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {

    this.restaurantName = this.route.snapshot.paramMap.get('name')!;
    const params = new HttpParams().set('name', this.restaurantName)
    this.http
      .get(`http://localhost:8090/v1/restaurant/name`, {
        params,
      })

      .subscribe((data: any) => {
        this.restaurantDetails = data;
      });
  }
}
