import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-homecategory',
  templateUrl: './homecategory.component.html',
  styleUrls: ['./homecategory.component.scss'],
})
export class HomecategoryComponent implements OnInit {
  categories: any[] = [];

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories() {
    this.categoryService.fetchCategories().subscribe({
      next: (res) => {
        this.categories = res;
      },
      error: (err) => {
        console.error('Error fetching categories', err);
      },
    });
  }

  goToCategory(categoryName: string) {
    this.router.navigate(['/category', categoryName.toLowerCase()]);
  }
}
