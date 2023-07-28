import { TestBed, inject } from '@angular/core/testing';

import { TestMappingService } from './test-mapping.service';

describe('TestMappingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestMappingService]
    });
  });

  it('should be created', inject([TestMappingService], (service: TestMappingService) => {
    expect(service).toBeTruthy();
  }));
});
