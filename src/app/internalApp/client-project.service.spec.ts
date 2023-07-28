import { TestBed, inject } from '@angular/core/testing';

import { ClientProjectService } from './client-project.service';

describe('ClientProjectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClientProjectService]
    });
  });

  it('should be created', inject([ClientProjectService], (service: ClientProjectService) => {
    expect(service).toBeTruthy();
  }));
});
