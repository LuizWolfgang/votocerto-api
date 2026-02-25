import { Test, TestingModule } from '@nestjs/testing';
import { ForecastsService } from './forecasts.service';

describe('ForecastsService', () => {
  let service: ForecastsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForecastsService],
    }).compile();

    service = module.get<ForecastsService>(ForecastsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
