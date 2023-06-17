import { Test, TestingModule } from '@nestjs/testing';
import { BanlistController } from './banlist.controller';

describe('ListController', () => {
	let controller: BanlistController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [BanlistController],
		}).compile();

		controller = module.get<BanlistController>(BanlistController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
