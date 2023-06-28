// eslint-disable-next-line max-classes-per-file
import { ContentReportType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
	IsDateString,
	IsIn, IsNotEmpty, IsOptional, IsString, IsUrl,
} from 'class-validator';

export class ContentReportCreateBody {
	@ApiProperty({
		description: 'The type of the content report.',
		enum: Object.values(ContentReportType),
	})
	@IsNotEmpty()
	@IsString()
	@IsIn(Object.values(ContentReportType))
		type: ContentReportType;

	@ApiProperty({
		description: 'Reason for the report.',
		required: false,
	})
	@IsOptional()
	@IsNotEmpty()
	@IsString()
		reason?: string;

	@ApiProperty({
		description: 'Link to the reported content.',
	})
	@IsNotEmpty()
	@IsString()
	@IsUrl()
		link: string;

	@ApiProperty({
		description: 'Time till which the report is valid',
		type: 'string',
		format: 'date-time',
	})
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@IsDateString()
		validTill?: string;
}

export class ContentReportEditBody {
	@ApiProperty({
		description: 'The type of the content report.',
		enum: Object.values(ContentReportType),
	})
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@IsIn(Object.values(ContentReportType))
		type?: ContentReportType;

	@ApiProperty({
		description: 'Reason for the report.',
		required: false,
	})
	@IsOptional()
	@IsNotEmpty()
	@IsString()
		reason?: string;

	@ApiProperty({
		description: 'Link to the reported content.',
	})
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@IsUrl()
		link?: string;

	@ApiProperty({
		description: 'Time till which the report is valid',
		type: 'string',
		format: 'date-time',
	})
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@IsDateString()
		validTill?: string;
}

export class ContentReport {
	@ApiProperty({
		description: 'Id of the report.',
	})
		id: bigint;

	@ApiProperty({
		description: 'The type of the content report.',
		enum: Object.values(ContentReportType),
	})
		type: ContentReportType;

	@ApiProperty({
		description: 'Reason for the report.',
		required: false,
	})
		reason: string | null;

	@ApiProperty({
		description: 'Link to the reported content.',
	})
		link: string;

	@ApiProperty({
		description: 'Time till which the report is valid',
		type: 'string',
		format: 'date-time',
	})
		validTill: Date | null;
}

export class ContentReportList {
	@ApiProperty({
		type: [ContentReport],
	})
		reports: ContentReport[];

	@ApiProperty()
		total: number;
}
