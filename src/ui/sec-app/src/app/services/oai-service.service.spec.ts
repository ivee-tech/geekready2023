import { TestBed } from '@angular/core/testing';

import { OaiService } from './oai-service.service';

describe('OaiServiceService', () => {
  let service: OaiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OaiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
