import { TestBed, inject } from '@angular/core/testing';

import { AssetInfoService } from './asset-info.service';

describe('AssetInfoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AssetInfoService]
    });
  });

  it('should be created', inject([AssetInfoService], (service: AssetInfoService) => {
    expect(service).toBeTruthy();
  }));
});
