import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProjectAddComponent } from './client-project-add.component';

describe('ClientProjectAddComponent', () => {
  let component: ClientProjectAddComponent;
  let fixture: ComponentFixture<ClientProjectAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientProjectAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientProjectAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
