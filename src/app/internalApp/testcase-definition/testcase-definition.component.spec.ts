import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestcaseDefinitionComponent } from './testcase-definition.component';

describe('TestcaseDefinitionComponent', () => {
  let component: TestcaseDefinitionComponent;
  let fixture: ComponentFixture<TestcaseDefinitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestcaseDefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestcaseDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
