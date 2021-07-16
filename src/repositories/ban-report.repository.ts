import { inject } from '@loopback/core';
import { DataObject, DefaultCrudRepository, Options } from '@loopback/repository';
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

	public async create(entity: DataObject<BanReport>, options?: Options): Promise<BanReport> {
		if (!this.dataSource.connected) {
			await this.dataSource.connect();
		}

		const mongoConnector = this.dataSource.connector!;

		const collection = mongoConnector.db.collection('Counters');

		const result = await collection.findOneAndUpdate(
			{
				collection: this.entityClass.name,
			},
			{
				$inc: { value: 1 },
			},
			{
				upsert: true,
				new: true,
			},
		);

		return super.create({
			id: result.value.value,
			...entity,
		}, options);
	}
}
