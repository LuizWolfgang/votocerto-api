import { Test, TestingModule } from '@nestjs/testing';
import { ForecastsController } from './forecasts.controller';

describe('ForecastsController', () => {
  let controller: ForecastsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForecastsController],
    }).compile();

    controller = module.get<ForecastsController>(ForecastsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
