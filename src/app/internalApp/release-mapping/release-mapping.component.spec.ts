import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseMappingComponent } from './release-mapping.component';

describe('ReleaseMappingComponent', () => {
  let component: ReleaseMappingComponent;
  let fixture: ComponentFixture<ReleaseMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleaseMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
