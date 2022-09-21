import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleBenComponent } from './multiple-ben.component';

describe('MultipleBenComponent', () => {
  let component: MultipleBenComponent;
  let fixture: ComponentFixture<MultipleBenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultipleBenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleBenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
