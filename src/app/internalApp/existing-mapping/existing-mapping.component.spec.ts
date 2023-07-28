import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingMappingComponent } from './existing-mapping.component';

describe('ExistingMappingComponent', () => {
  let component: ExistingMappingComponent;
  let fixture: ComponentFixture<ExistingMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExistingMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistingMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
