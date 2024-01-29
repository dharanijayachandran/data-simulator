import { TestBed } from '@angular/core/testing';

import { DataSimulatorService } from './data-simulator.service';

describe('DataSimulatorService', () => {
  let service: DataSimulatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataSimulatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
