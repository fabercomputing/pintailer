import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PintailerVideoComponent } from './pintailer-video.component';

describe('PintailerVideoComponent', () => {
  let component: PintailerVideoComponent;
  let fixture: ComponentFixture<PintailerVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PintailerVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PintailerVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
