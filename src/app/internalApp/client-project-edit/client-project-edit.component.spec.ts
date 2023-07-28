import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProjectEditComponent } from './client-project-edit.component';

describe('ClientProjectEditComponent', () => {
  let component: ClientProjectEditComponent;
  let fixture: ComponentFixture<ClientProjectEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientProjectEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientProjectEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
