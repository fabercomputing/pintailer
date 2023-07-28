import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionPopupComponent } from './version-popup.component';

describe('VersionPopupComponent', () => {
  let component: VersionPopupComponent;
  let fixture: ComponentFixture<VersionPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VersionPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
