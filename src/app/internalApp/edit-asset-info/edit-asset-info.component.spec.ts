import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAssetInfoComponent } from './edit-asset-info.component';

describe('EditAssetInfoComponent', () => {
  let component: EditAssetInfoComponent;
  let fixture: ComponentFixture<EditAssetInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAssetInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAssetInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
