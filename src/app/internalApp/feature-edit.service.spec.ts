import { TestBed } from '@angular/core/testing';

import { FeatureEditService } from './feature-edit.service';

describe('FeatureEditService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FeatureEditService = TestBed.get(FeatureEditService);
    expect(service).toBeTruthy();
  });
});
