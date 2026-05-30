import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSetupComponent } from './setup';

describe('ProfileSetupComponent', () => {
  let component: ProfileSetupComponent;
  let fixture: ComponentFixture<ProfileSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSetupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSetupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
