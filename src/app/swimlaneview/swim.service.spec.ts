import { TestBed, inject } from '@angular/core/testing';
import {HttpModule} from '@angular/http';

import { SwimService } from './swim.service';

describe('SwimService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule], 
      providers: [SwimService]
    });
  });

  it('should ...', inject([SwimService], (service: SwimService) => {
    expect(service).toBeTruthy();
  }));
});
