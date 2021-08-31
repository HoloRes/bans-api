import { Entity, model, property } from '@loopback/repository';

@model({ settings: { mongodb: { collection: 'alts' } } })
export class AltList extends Entity {
	@property({
		type: 'string',
		id: true,
		generated: false,
		required: true,
	})
	id: string;

	@property({
		type: 'array',
		itemType: 'string',
		required: true,
	})
	altOf: string[];

	constructor(data?: Partial<AltList>) {
		super(data);
	}
}

export interface AltListRelations {
	// describe navigational properties here
}

export type AltListWithRelations = AltList & AltListRelations;
