import { TestBed, inject } from '@angular/core/testing';

import { TestcaseExecutionService } from './testcase-execution.service';

describe('TestcaseExecutionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestcaseExecutionService]
    });
  });

  it('should be created', inject([TestcaseExecutionService], (service: TestcaseExecutionService) => {
    expect(service).toBeTruthy();
  }));
});
