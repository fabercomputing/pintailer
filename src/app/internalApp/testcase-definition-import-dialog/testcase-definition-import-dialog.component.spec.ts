import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestcaseDefinitionImportDialogComponent } from './testcase-definition-import-dialog.component';

describe('TestcaseDefinitionImportDialogComponent', () => {
  let component: TestcaseDefinitionImportDialogComponent;
  let fixture: ComponentFixture<TestcaseDefinitionImportDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestcaseDefinitionImportDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestcaseDefinitionImportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
