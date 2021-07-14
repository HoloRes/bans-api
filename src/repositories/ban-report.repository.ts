import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { MongoDbDataSource } from '../datasources';
import { BanReport, BanReportRelations } from '../models';

export class BanReportRepository extends DefaultCrudRepository<
	BanReport,
	typeof BanReport.prototype.id,
	BanReportRelations
> {
	constructor(
		@inject('datasources.MongoDB') dataSource: MongoDbDataSource,
	) {
		super(BanReport, dataSource);
	}
}
