import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestMappingComponent } from './test-mapping.component';

describe('TestMappingComponent', () => {
  let component: TestMappingComponent;
  let fixture: ComponentFixture<TestMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
