import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachBugComponent } from './attach-bug.component';

describe('AttachBugComponent', () => {
  let component: AttachBugComponent;
  let fixture: ComponentFixture<AttachBugComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachBugComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachBugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
