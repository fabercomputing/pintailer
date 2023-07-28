import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestcaseExecutionAddDialogComponent } from './testcase-execution-add-dialog.component';

describe('TestcaseExecutionAddDialogComponent', () => {
  let component: TestcaseExecutionAddDialogComponent;
  let fixture: ComponentFixture<TestcaseExecutionAddDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestcaseExecutionAddDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestcaseExecutionAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
