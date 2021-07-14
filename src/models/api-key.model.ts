import { Model, model, property } from '@loopback/repository';

@model()
export class ApiKey extends Model {
	@property({
		type: 'string',
		id: true,
		generated: false,
		required: true,
	})
	key: string;

	@property({
		type: 'string',
		required: true,
	})
	owner: string;

	@property({
		type: 'boolean',
		default: false,
	})
	mqEnabled?: boolean;

	@property({
		type: 'number',
		default: 0,
	})
	mqMisses?: number;

	constructor(data?: Partial<ApiKey>) {
		super(data);
	}
}

export interface ApiKeyRelations {
	// describe navigational properties here
}

export type ApiKeyWithRelations = ApiKey & ApiKeyRelations;
