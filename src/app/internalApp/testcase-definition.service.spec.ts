import { TestBed, inject } from '@angular/core/testing';

import { TestcaseDefinitionService } from './testcase-definition.service';

describe('TestcaseDefinitionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestcaseDefinitionService]
    });
  });

  it('should be created', inject([TestcaseDefinitionService], (service: TestcaseDefinitionService) => {
    expect(service).toBeTruthy();
  }));
});
