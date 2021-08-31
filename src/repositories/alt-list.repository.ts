import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { MongoDbDataSource } from '../datasources';
import { AltList, AltListRelations } from '../models';

export class AltListRepository extends DefaultCrudRepository<
	AltList,
	typeof AltList.prototype.id,
	AltListRelations
	> {
	constructor(
		@inject('datasources.MongoDB') dataSource: MongoDbDataSource,
	) {
		super(AltList, dataSource);
	}
}
