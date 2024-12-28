import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AditTourComponent } from './adit-tour.component';

describe('AditTourComponent', () => {
  let component: AditTourComponent;
  let fixture: ComponentFixture<AditTourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AditTourComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AditTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
