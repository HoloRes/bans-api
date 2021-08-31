import { Entity, model, property } from '@loopback/repository';

@model({ settings: { mongodb: { collection: 'content' } } })
export class ContentReport extends Entity {
	@property({
		type: 'string',
		required: true,
	})
	link: string;

	@property({
		type: 'string',
		required: true,
	})
	type: string;

	@property({
		type: 'number',
		id: true,
		generated: true,
	})
	id?: number;

	constructor(data?: Partial<ContentReport>) {
		super(data);
	}
}

export interface ContentReportRelations {
	// describe navigational properties here
}

export type ContentReportWithRelations = ContentReport & ContentReportRelations;
