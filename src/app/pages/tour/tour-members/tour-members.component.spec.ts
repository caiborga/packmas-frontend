import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourMembersComponent } from './tour-members.component';

describe('TourMembersComponent', () => {
  let component: TourMembersComponent;
  let fixture: ComponentFixture<TourMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourMembersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TourMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
