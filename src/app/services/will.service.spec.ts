import { TestBed } from '@angular/core/testing';

import { WillService } from './will.service';

describe('WillService', () => {
  let service: WillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
