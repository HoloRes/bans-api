import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
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
	getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody,
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
	@authenticate('bearer')
	@authorize({ scopes: ['CREATE'] })
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
	@authenticate('bearer')
	@authorize({ scopes: ['ADMIN'] })
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

	@get('/check/{id}')
	@response(200, {
		description: 'BanReport model instance',
		content: {
			'application/json': {
				schema: getModelSchemaRef(BanReport, { includeRelations: true }),
			},
		},
	})
	async findUserById(
	@param.path.string('id') id: string,
	): Promise<BanReport> {
		const doc = await this.banReportRepository.findOne({ userId: id } as Filter<BanReport>);
		if (doc) return doc;
		throw HttpErrors(404, `Entity not found: banReport with userId ${id}`, { name: 'Error', code: 'ENTITY_NOT_FOUND' });
	}

	@patch('/ban/{id}/proof')
	@response(204, {
		description: 'BanReport PATCH success',
	})
	@authenticate('bearer')
	@authorize({ scopes: ['CREATE'] })
	async updateProof(
		@param.path.number('id') id: number,
		@requestBody.array({
			schema: { type: 'string' },
		}, {
			description: 'An array of url\'s linking to proof images',
			required: true,
		}) urls: string[],
	): Promise<void> {
		await this.banReportRepository.execute('bans', 'update', [{ q: { _id: id }, $push: { proof: { $each: urls } } }]);
	}

	@patch('/ban/{id}/alt')
	@response(204, {
		description: 'BanReport PATCH success',
	})
	@authenticate('bearer')
	@authorize({ scopes: ['CREATE'] })
	async updateAltList(
		@param.path.number('id') id: number,
		@requestBody.array({
			schema: { type: 'string' },
		}, {
			description: 'An array of Discord user id\'s',
			required: true,
		}) urls: string[],
	): Promise<void> {
		await this.banReportRepository.execute('bans', 'update', [{ q: { _id: id }, $push: { altOf: { $each: urls } } }]);
	}

	@patch('/ban/{id}')
	@response(204, {
		description: 'BanReport PATCH success',
	})
	@authenticate('bearer')
	@authorize({ scopes: ['ADMIN'] })
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
	@authenticate('bearer')
	@authorize({ scopes: ['ADMIN'] })
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
