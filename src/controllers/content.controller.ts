import {
	Count,
	CountSchema,
	Filter,
	FilterExcludingWhere,
	repository,
	Where,
} from '@loopback/repository';
import {
	post,
	param,
	get,
	getModelSchemaRef,
	patch,
	put,
	del,
	requestBody,
	response, visibility,
} from '@loopback/rest';
import { inject } from '@loopback/context';
import { SecurityBindings, UserProfile } from '@loopback/security';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { OperationVisibility } from '@loopback/openapi-v3';
import { ContentReport } from '../models';
import { ContentReportRepository } from '../repositories';

@authenticate('ApiKey')
@authorize({ scopes: ['CONTENT_REPORT_ACCESS'] })
export class ContentController {
	constructor(
		@repository(ContentReportRepository)
		public contentReportRepository : ContentReportRepository,
		@inject(SecurityBindings.USER)
		private userProfile: UserProfile,
	) {}

	@post('/content')
	@response(200, {
		description: 'ContentReport model instance',
		content: { 'application/json': { schema: getModelSchemaRef(ContentReport) } },
	})
	async create(
		@requestBody({
			content: {
				'application/json': {
					schema: getModelSchemaRef(ContentReport, {
						title: 'NewContentReport',
						exclude: ['id'],
					}),
				},
			},
		})
			contentReport: Omit<ContentReport, 'id'>,
	): Promise<ContentReport> {
		return this.contentReportRepository.create(contentReport);
	}

	@get('/content/count')
	@response(200, {
		description: 'ContentReport model count',
		content: { 'application/json': { schema: CountSchema } },
	})
	async count(
		@param.where(ContentReport) where?: Where<ContentReport>,
	): Promise<Count> {
		return this.contentReportRepository.count(where);
	}

	@get('/content')
	@response(200, {
		description: 'Array of ContentReport model instances',
		content: {
			'application/json': {
				schema: {
					type: 'array',
					items: getModelSchemaRef(ContentReport, { includeRelations: true }),
				},
			},
		},
	})
	async find(
		@param.filter(ContentReport) filter?: Filter<ContentReport>,
	): Promise<ContentReport[]> {
		return this.contentReportRepository.find(filter);
	}

	@patch('/content')
	@response(200, {
		description: 'ContentReport PATCH success count',
		content: { 'application/json': { schema: CountSchema } },
	})
	@authorize({ scopes: ['ADMIN'] })
	@visibility(OperationVisibility.UNDOCUMENTED)
	async updateAll(
		@requestBody({
			content: {
				'application/json': {
					schema: getModelSchemaRef(ContentReport, { partial: true }),
				},
			},
		})
			contentReport: ContentReport,
		@param.where(ContentReport) where?: Where<ContentReport>,
	): Promise<Count> {
		return this.contentReportRepository.updateAll(contentReport, where);
	}

	@get('/content/{id}')
	@response(200, {
		description: 'ContentReport model instance',
		content: {
			'application/json': {
				schema: getModelSchemaRef(ContentReport, { includeRelations: true }),
			},
		},
	})
	async findById(
		@param.path.number('id') id: number,
		@param.filter(ContentReport, { exclude: 'where' }) filter?: FilterExcludingWhere<ContentReport>,
	): Promise<ContentReport> {
		return this.contentReportRepository.findById(id, filter);
	}

	@patch('/content/{id}')
	@response(204, {
		description: 'ContentReport PATCH success',
	})
	@authorize({ scopes: ['ADMIN'] })
	@visibility(OperationVisibility.UNDOCUMENTED)
	async updateById(
		@param.path.number('id') id: number,
		@requestBody({
			content: {
				'application/json': {
					schema: getModelSchemaRef(ContentReport, { partial: true }),
				},
			},
		})
			contentReport: ContentReport,
	): Promise<void> {
		await this.contentReportRepository.updateById(id, contentReport);
	}

	@put('/content/{id}')
	@response(204, {
		description: 'ContentReport PUT success',
	})
	@authorize({ scopes: ['ADMIN'] })
	@visibility(OperationVisibility.UNDOCUMENTED)
	async replaceById(
		@param.path.number('id') id: number,
		@requestBody() contentReport: ContentReport,
	): Promise<void> {
		await this.contentReportRepository.replaceById(id, contentReport);
	}

	@del('/content/{id}')
	@response(204, {
		description: 'ContentReport DELETE success',
	})
	@authorize({ scopes: ['ADMIN'] })
	@visibility(OperationVisibility.UNDOCUMENTED)
	async deleteById(@param.path.number('id') id: number): Promise<void> {
		await this.contentReportRepository.deleteById(id);
	}
}
