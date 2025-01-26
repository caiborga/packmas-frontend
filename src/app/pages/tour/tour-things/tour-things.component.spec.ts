import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourThingsComponent } from './tour-things.component';

describe('TourThingsComponent', () => {
  let component: TourThingsComponent;
  let fixture: ComponentFixture<TourThingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourThingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TourThingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
