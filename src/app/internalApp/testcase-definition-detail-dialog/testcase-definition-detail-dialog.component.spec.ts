import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestcaseDefinitionDetailDialogComponent } from './testcase-definition-detail-dialog.component';

describe('TestcaseDefinitionDetailDialogComponent', () => {
  let component: TestcaseDefinitionDetailDialogComponent;
  let fixture: ComponentFixture<TestcaseDefinitionDetailDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestcaseDefinitionDetailDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestcaseDefinitionDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
