import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProjectDeleteComponent } from './client-project-delete.component';

describe('ClientProjectDeleteComponent', () => {
  let component: ClientProjectDeleteComponent;
  let fixture: ComponentFixture<ClientProjectDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientProjectDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientProjectDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
