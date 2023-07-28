import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BugInfoBoxComponent } from './bug-info-box.component';

describe('BugInfoBoxComponent', () => {
  let component: BugInfoBoxComponent;
  let fixture: ComponentFixture<BugInfoBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BugInfoBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BugInfoBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
