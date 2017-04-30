import { TestBed, inject } from '@angular/core/testing';

import { SwimService } from './swim.service';

describe('SwimService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SwimService]
    });
  });

  it('should ...', inject([SwimService], (service: SwimService) => {
    expect(service).toBeTruthy();
  }));
});
