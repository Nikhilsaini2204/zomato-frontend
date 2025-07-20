import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-categorydetail',
  templateUrl: './categorydetail.component.html',
  styleUrls: ['./categorydetail.component.scss'],
})
export class CategorydetailComponent implements OnInit {
  categoryName = '';
  restaurants: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryName = this.route.snapshot.paramMap.get('name')!;
    this.fetchRestaurants(this.categoryName);
  }

  fetchRestaurants(categoryName: string) {
    this.categoryService.fetchRestaurantsByCategory(categoryName).subscribe({
      next: (res) => {
        this.restaurants = res;
      },
      error: (err) => {
        console.error('Error fetching dishes:', err);
      },
    });
  }

  goToRestaurant(name: string) {
    this.router.navigate(['/restaurant', name]);
  }
}
