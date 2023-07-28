import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestcaseDefinitionAddDialogComponent } from './testcase-definition-add-dialog.component';

describe('TestcaseDefinitionAddDialogComponent', () => {
  let component: TestcaseDefinitionAddDialogComponent;
  let fixture: ComponentFixture<TestcaseDefinitionAddDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestcaseDefinitionAddDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestcaseDefinitionAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
