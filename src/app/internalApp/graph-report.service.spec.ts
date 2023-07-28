import { TestBed, inject } from '@angular/core/testing';

import { GraphReportService } from './graph-report.service';

describe('GraphReportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GraphReportService]
    });
  });

  it('should be created', inject([GraphReportService], (service: GraphReportService) => {
    expect(service).toBeTruthy();
  }));
});
