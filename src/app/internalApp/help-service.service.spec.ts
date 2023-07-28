import { TestBed, inject } from '@angular/core/testing';

import { HelpServiceService } from './help-service.service';

describe('HelpServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HelpServiceService]
    });
  });

  it('should be created', inject([HelpServiceService], (service: HelpServiceService) => {
    expect(service).toBeTruthy();
  }));
});
