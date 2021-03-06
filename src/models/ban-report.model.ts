import { Entity, model, property } from '@loopback/repository';

@model({ settings: { mongodb: { collection: 'bans' } } })
export class BanReport extends Entity {
	@property({
		type: 'string',
		required: true,
	})
	userId: string;

	@property({
		type: 'number',
		id: true,
	})
	id?: number;

	@property({
		type: 'string',
		required: true,
	})
	moderator: string;

	@property({
		type: 'string',
		required: true,
	})
	type: string;

	@property({
		type: 'string',
		required: true,
	})
	reason: string;

	@property({
		type: 'array',
		itemType: 'string',
	})
	proof?: string[];

	@property({
		type: 'boolean',
		default: true,
	})
	active?: boolean;

	@property({
		type: 'boolean',
		default: true,
	})
	valid?: boolean;

	@property({
		type: 'boolean',
		default: false,
	})
	appealed?: boolean;

	@property({
		type: 'array',
		itemType: 'string',
	})
	altOf?: string[];

	constructor(data?: Partial<BanReport>) {
		super(data);
	}
}

export interface BanReportRelations {
	// describe navigational properties here
}

export type BanReportWithRelations = BanReport & BanReportRelations;
