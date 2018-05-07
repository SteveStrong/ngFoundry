import { TestBed, inject } from '@angular/core/testing';
import {HttpClientModule} from '@angular/http';

import { SwimService } from './swim.service';

describe('SwimService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [SwimService]
    });
  });

  it('should ...', inject([SwimService], (service: SwimService) => {
    expect(service).toBeTruthy();
  }));
});
