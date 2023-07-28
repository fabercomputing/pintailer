import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportPopupComponent } from './support-popup.component';

describe('SupportPopupComponent', () => {
  let component: SupportPopupComponent;
  let fixture: ComponentFixture<SupportPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupportPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
