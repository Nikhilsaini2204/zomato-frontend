import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorydetailComponent } from './categorydetail.component';

describe('CategorydetailComponent', () => {
  let component: CategorydetailComponent;
  let fixture: ComponentFixture<CategorydetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategorydetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategorydetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
