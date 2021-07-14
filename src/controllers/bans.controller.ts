import {
	Count,
	CountSchema,
	Filter,
	FilterExcludingWhere,
	repository,
	Where,
} from '@loopback/repository';
import {
	del, get,
	getModelSchemaRef, param, patch, post, put, requestBody,
	response,
} from '@loopback/rest';
import { BanReport } from '../models';
import { BanReportRepository } from '../repositories';

export class BansController {
	constructor(
	@repository(BanReportRepository)
	public banReportRepository : BanReportRepository,
	) {}

	@post('/ban')
	@response(200, {
		description: 'BanReport model instance',
		content: { 'application/json': { schema: getModelSchemaRef(BanReport) } },
	})
	async create(
	@requestBody({
		content: {
			'application/json': {
				schema: getModelSchemaRef(BanReport, {
					title: 'NewBanReport',
					exclude: ['id'],
				}),
			},
		},
	})
		banReport: Omit<BanReport, 'id'>,
	): Promise<BanReport> {
		return this.banReportRepository.create(banReport);
	}

	@get('/count')
	@response(200, {
		description: 'BanReport model count',
		content: { 'application/json': { schema: CountSchema } },
	})
	async count(
	@param.where(BanReport) where?: Where<BanReport>,
	): Promise<Count> {
		return this.banReportRepository.count(where);
	}

	@get('/list')
	@response(200, {
		description: 'Array of BanReport model instances',
		content: {
			'application/json': {
				schema: {
					type: 'array',
					items: getModelSchemaRef(BanReport, { includeRelations: true }),
				},
			},
		},
	})
	async list(): Promise<BanReport[]> {
		return this.banReportRepository.find();
	}

	@get('/find')
	@response(200, {
		description: 'Array of BanReport model instances',
		content: {
			'application/json': {
				schema: {
					type: 'array',
					items: getModelSchemaRef(BanReport, { includeRelations: true }),
				},
			},
		},
	})
	async find(
	@param.filter(BanReport) filter?: Filter<BanReport>,
	): Promise<BanReport[]> {
		return this.banReportRepository.find(filter);
	}

	@patch('/ban')
	@response(200, {
		description: 'BanReport PATCH success count',
		content: { 'application/json': { schema: CountSchema } },
	})
	async updateAll(
	@requestBody({
		content: {
			'application/json': {
				schema: getModelSchemaRef(BanReport, { partial: true }),
			},
		},
	})
		banReport: BanReport,
	@param.where(BanReport) where?: Where<BanReport>,
	): Promise<Count> {
		return this.banReportRepository.updateAll(banReport, where);
	}

	@get('/ban/{id}')
	@response(200, {
		description: 'BanReport model instance',
		content: {
			'application/json': {
				schema: getModelSchemaRef(BanReport, { includeRelations: true }),
			},
		},
	})
	async findById(
	@param.path.number('id') id: number,
	@param.filter(BanReport, { exclude: 'where' }) filter?: FilterExcludingWhere<BanReport>,
	): Promise<BanReport> {
		return this.banReportRepository.findById(id, filter);
	}

	@patch('/ban/{id}')
	@response(204, {
		description: 'BanReport PATCH success',
	})
	async updateById(
	@param.path.number('id') id: number,
	@requestBody({
		content: {
			'application/json': {
				schema: getModelSchemaRef(BanReport, { partial: true }),
			},
		},
	})
		banReport: BanReport,
	): Promise<void> {
		await this.banReportRepository.updateById(id, banReport);
	}

	@put('/ban/{id}')
	@response(204, {
		description: 'BanReport PUT success',
	})
	async replaceById(
	@param.path.number('id') id: number,
	@requestBody() banReport: BanReport,
	): Promise<void> {
		await this.banReportRepository.replaceById(id, banReport);
	}

	@del('/ban/{id}')
	@response(204, {
		description: 'BanReport DELETE success',
	})
	async deleteById(@param.path.number('id') id: number): Promise<void> {
		await this.banReportRepository.deleteById(id);
	}
}
