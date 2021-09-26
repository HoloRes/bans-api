import { FilterExcludingWhere, repository } from '@loopback/repository';
import { inject } from '@loopback/context';
import { SecurityBindings, UserProfile } from '@loopback/security';
import {
	get, getModelSchemaRef, param, response,
} from '@loopback/rest';
import { AltListRepository } from '../repositories';
import { AltList } from '../models';

export class AltsController {
	constructor(
		@repository(AltListRepository)
		public altListRepository : AltListRepository,
		@inject(SecurityBindings.USER, { optional: true })
		private userProfile: UserProfile,
	) {}

	@get('/alts/{id}')
	@response(200, {
		description: 'BanReport model instance',
		content: {
			'application/json': {
				schema: getModelSchemaRef(AltList, { includeRelations: true }),
			},
		},
	})
	async findById(
		@param.path.string('id') id: string,
		@param.filter(AltList, { exclude: 'where' }) filter?: FilterExcludingWhere<AltList>,
	): Promise<AltList> {
		return this.altListRepository.findById(id, filter);
	}
}
