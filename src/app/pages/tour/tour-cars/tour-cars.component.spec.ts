import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourCarsComponent } from './tour-cars.component';

describe('TourCarsComponent', () => {
  let component: TourCarsComponent;
  let fixture: ComponentFixture<TourCarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourCarsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TourCarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
