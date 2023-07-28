import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowTestCaseComponent } from './show-test-case.component';

describe('ShowTestCaseComponent', () => {
  let component: ShowTestCaseComponent;
  let fixture: ComponentFixture<ShowTestCaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowTestCaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowTestCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
