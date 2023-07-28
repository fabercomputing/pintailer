import { TestBed, inject } from '@angular/core/testing';

import { ReleaseMappingService } from './release-mapping.service';

describe('ReleaseMappingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReleaseMappingService]
    });
  });

  it('should be created', inject([ReleaseMappingService], (service: ReleaseMappingService) => {
    expect(service).toBeTruthy();
  }));
});
