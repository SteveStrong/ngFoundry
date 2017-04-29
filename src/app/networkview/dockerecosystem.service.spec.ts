import { TestBed, inject } from '@angular/core/testing';

import { DockerecosystemService } from './dockerecosystem.service';

describe('DockerecosystemService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DockerecosystemService]
    });
  });

  it('should ...', inject([DockerecosystemService], (service: DockerecosystemService) => {
    expect(service).toBeTruthy();
  }));
});
