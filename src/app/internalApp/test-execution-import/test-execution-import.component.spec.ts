import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestExecutionImportComponent } from './test-execution-import.component';

describe('TestExecutionImportComponent', () => {
  let component: TestExecutionImportComponent;
  let fixture: ComponentFixture<TestExecutionImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestExecutionImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestExecutionImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
