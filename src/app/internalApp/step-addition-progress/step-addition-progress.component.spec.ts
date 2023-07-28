import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepAdditionProgressComponent } from './step-addition-progress.component';

describe('StepAdditionProgressComponent', () => {
  let component: StepAdditionProgressComponent;
  let fixture: ComponentFixture<StepAdditionProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepAdditionProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepAdditionProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
