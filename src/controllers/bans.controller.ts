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
	api,
	del, deprecated, get,
	getModelSchemaRef, HttpErrors, operation, param, patch, put, requestBody,
	response, visibility,
} from '@loopback/rest';
import { inject } from '@loopback/context';
import { UserProfile, SecurityBindings } from '@loopback/security';
import { OperationVisibility } from '@loopback/openapi-v3';
import { BanReport } from '../models';
import { BanReportRepository } from '../repositories';
import { publish, publishRemoval } from '../zeromq';
import { schemeSpec } from '../authentication/apikey.strategy';

@api({
	components: {
		securitySchemes: {
			ApiKey: schemeSpec,
		},
	},
})
export class BansController {
	constructor(
	@repository(BanReportRepository)
	public banReportRepository : BanReportRepository,
	@inject(SecurityBindings.USER, { optional: true })
	private userProfile: UserProfile,
	) {}

	@operation('POST', '/ban', {
		description: 'Add proof to a ban. Requires `CREATE` permission.',
		responses: {
			200: {
				description: 'BanReport model instance',
				content: { 'application/json': { schema: getModelSchemaRef(BanReport) } },
			},
		},
		security: [{ ApiKey: [] }],
	})
	@authenticate('api-key')
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
		const document = await this.banReportRepository.create(banReport);
		await publish('create', document);
		return document;
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
	@authenticate('api-key', 'no-auth')
	async list(): Promise<BanReport[]> {
		if (this.userProfile.permissions!.includes('VIEWALL')) return this.banReportRepository.find();

		const docs = await this.banReportRepository.find();

		return docs.map((doc) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { proof: _, ...publicDocument } = doc;
			return publicDocument;
		}) as BanReport[];
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
	@authenticate('api-key', 'no-auth')
	async find(
	@param.filter(BanReport) filter?: Filter<BanReport>,
	): Promise<BanReport[]> {
		if (this.userProfile.permissions!.includes('VIEWALL')) return this.banReportRepository.find(filter);

		const docs = await this.banReportRepository.find(filter);

		return docs.map((doc) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { proof: _, ...publicDocument } = doc;
			return publicDocument;
		}) as BanReport[];
	}

	@patch('/ban')
	@response(200, {
		description: 'BanReport PATCH success count',
		content: { 'application/json': { schema: CountSchema } },
	})
	@authenticate('api-key')
	@authorize({ scopes: ['ADMIN'] })
	@visibility(OperationVisibility.UNDOCUMENTED)
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
	@authenticate('api-key', 'no-auth')
	async findById(
	@param.path.number('id') id: number,
	@param.filter(BanReport, { exclude: 'where' }) filter?: FilterExcludingWhere<BanReport>,
	): Promise<BanReport> {
		const doc = await this.banReportRepository.findById(id, filter);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { proof: _, ...publicDocument } = doc;
		return (this.userProfile.permissions!.includes('VIEWALL') ? doc : publicDocument) as BanReport;
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
	@authenticate('api-key', 'no-auth')
	async findUserById(
	@param.path.string('id') id: string,
	): Promise<BanReport> {
		const doc = await this.banReportRepository.findOne({ userId: id } as Filter<BanReport>);
		if (doc) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { proof: _, ...publicDocument } = doc;
			return (this.userProfile.permissions!.includes('VIEWALL') ? doc : publicDocument) as BanReport;
		}
		throw HttpErrors(404, `Entity not found: banReport with userId ${id}`, { name: 'Error', code: 'ENTITY_NOT_FOUND' });
	}

	@operation('PATCH', '/ban/{id}/proof', {
		description: 'Add proof to a ban. Requires `CREATE` permission.',
		responses: {
			204: {
				description: 'BanReport PATCH success',
			},
		},
		security: [{ ApiKey: [] }],
	})
	@authenticate('api-key')
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
		const document = await this.banReportRepository.findById(id);
		await publish('update', document);
	}

	@deprecated(true)
	@operation('PATCH', '/ban/{id}/alt', {
		description: 'Add an alt user id to an existing ban. Requires `CREATE` permission.',
		responses: {
			204: {
				description: 'BanReport PATCH success',
			},
		},
		security: [{ ApiKey: [] }],
	})
	@authenticate('api-key')
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
		const document = await this.banReportRepository.findById(id);
		await publish('update', document);
	}

	@patch('/ban/{id}')
	@response(204, {
		description: 'BanReport PATCH success',
	})
	@authenticate('api-key')
	@authorize({ scopes: ['ADMIN'] })
	@visibility(OperationVisibility.UNDOCUMENTED)
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
		const document = await this.banReportRepository.findById(id);
		await publish('update', document);
	}

	@put('/ban/{id}')
	@response(204, {
		description: 'BanReport PUT success',
	})
	@authenticate('api-key')
	@authorize({ scopes: ['ADMIN'] })
	@visibility(OperationVisibility.UNDOCUMENTED)
	async replaceById(
	@param.path.number('id') id: number,
	@requestBody() banReport: BanReport,
	): Promise<void> {
		await this.banReportRepository.replaceById(id, banReport);
	}

	@del('/ban/{id}')
	@visibility(OperationVisibility.UNDOCUMENTED)
	@response(204, {
		description: 'BanReport DELETE success',
	})
	async deleteById(@param.path.number('id') id: number): Promise<void> {
		await this.banReportRepository.deleteById(id);
		await publishRemoval(id.toString(10));
	}
}
