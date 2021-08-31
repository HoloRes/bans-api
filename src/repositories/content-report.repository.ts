import { inject } from '@loopback/core';
import { DataObject, DefaultCrudRepository, Options } from '@loopback/repository';
import { MongoDbDataSource } from '../datasources';
import { ContentReport, ContentReportRelations } from '../models';

export class ContentReportRepository extends DefaultCrudRepository<
	ContentReport,
	typeof ContentReport.prototype.id,
	ContentReportRelations
	> {
	constructor(
		@inject('datasources.MongoDB') dataSource: MongoDbDataSource,
	) {
		super(ContentReport, dataSource);
	}

	// eslint-disable-next-line max-len
	public async create(entity: DataObject<ContentReport>, options?: Options): Promise<ContentReport> {
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
