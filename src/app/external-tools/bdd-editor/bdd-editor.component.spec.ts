import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BddEditorComponent } from './bdd-editor.component';

describe('BddEditorComponent', () => {
  let component: BddEditorComponent;
  let fixture: ComponentFixture<BddEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BddEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BddEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
