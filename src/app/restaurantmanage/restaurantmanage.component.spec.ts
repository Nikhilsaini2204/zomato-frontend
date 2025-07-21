import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantmanageComponent } from './restaurantmanage.component';

describe('RestaurantmanageComponent', () => {
  let component: RestaurantmanageComponent;
  let fixture: ComponentFixture<RestaurantmanageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RestaurantmanageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantmanageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
