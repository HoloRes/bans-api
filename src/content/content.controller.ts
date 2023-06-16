import {
	BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query,
} from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiOkResponse, ApiOperation,
	ApiParam,
	ApiQuery,
	ApiSecurity, ApiTags,
} from '@nestjs/swagger';
import { Permissions } from '../auth/permissions.decorator';
import { Permission } from '../auth/permission.enum';
import { PrismaService } from '../prisma.service';
import {
	ContentReport, ContentReportCreateBody, ContentReportEditBody, ContentReportList,
} from './content.dto';

@ApiSecurity('apiKey')
@ApiTags('Content')
@Controller('content')
export class ContentController {
	constructor(private prisma: PrismaService) {}

	// Public create and edit operations
	@Post('report')
	@Permissions(Permission.Create, Permission.Admin)
	@ApiOperation({ description: 'Create a new content report.' })
	@ApiCreatedResponse({ description: 'The report has been successfully created.', type: ContentReport })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	async create(@Body() reportData: ContentReportCreateBody): Promise<ContentReport> {
		const { validTill: validTillString, ...data } = reportData;

		let validTill: Date | null = null;
		if (validTillString) {
			const parsedTimestamp = Date.parse(validTillString);
			if (Number.isNaN(validTill)) {
				throw new BadRequestException('validTill is not a valid time string.');
			}
			validTill = new Date(parsedTimestamp);
		}

		return this.prisma.contentReport.create({
			data: {
				validTill,
				...data,
			},
		});
	}

	// Generic find operations
	@Get('list')
	@Permissions(Permission.View, Permission.Create, Permission.Admin)
	@ApiOperation({ description: 'List all the content reports, paginated.' })
	@ApiOkResponse({ description: 'List of reports.', type: ContentReportList })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiQuery({
		name: 'offset', type: 'number', allowEmptyValue: true, description: 'Must be 0 or higher.', schema: { minimum: 0 },
	})
	@ApiQuery({
		name: 'limit', type: 'number', allowEmptyValue: true, description: 'Must be between 1 and 250, default is 50.', schema: { minimum: 1, maximum: 250, default: 50 },
	})
	async findAll(@Query('offset') offset = 0, @Query('limit') limit = 50): Promise<ContentReportList> {
		const reports = await this.prisma.contentReport.findMany({
			skip: Math.max(offset, 0),
			take: Math.min(limit, 250),
		});

		const reportCount = await this.prisma.userReport.count();

		return {
			reports,
			total: reportCount,
		};
	}

	@Get('find')
	@Permissions(Permission.View, Permission.Create, Permission.Admin)
	@ApiOperation({ description: 'Finds all content reports containing the query in the link.' })
	@ApiQuery({
		name: 'query', type: 'string', description: 'String to search for',
	})
	@ApiQuery({
		name: 'caseInsensitive', type: 'boolean', description: 'Disable case sensitivity.', allowEmptyValue: true, schema: { default: false },
	})
	async find(@Query('query') query: string, @Query('caseInsensitive') caseInsensitive = false): Promise<ContentReport[]> {
		return this.prisma.contentReport.findMany({
			where: {
				link: {
					contains: query,
					mode: caseInsensitive ? 'insensitive' : 'default',
				},
			},
		});
	}

	@Get('search')
	@Permissions(Permission.View, Permission.Create, Permission.Admin)
	@ApiOperation({ description: 'Finds all content reports containing the query using full text search.' })
	@ApiQuery({
		name: 'query', type: 'string', description: 'String to search for',
	})
	@ApiQuery({
		name: 'caseInsensitive', type: 'boolean', description: 'Disable case sensitivity.', allowEmptyValue: true, schema: { default: false },
	})
	async search(@Query('query') query: string, @Query('caseInsensitive') caseInsensitive = false): Promise<ContentReport[]> {
		return this.prisma.contentReport.findMany({
			where: {
				link: {
					search: query,
					mode: caseInsensitive ? 'insensitive' : 'default',
				},
			},
		});
	}

	// Admin operations
	@Patch('report/:id')
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'Update a content report' })
	@ApiOkResponse({ description: 'The updated report.', type: ContentReport })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({
		name: 'id', type: 'number', description: 'Content report id', schema: { minimum: 0 },
	})
	async editReport(@Body() data: ContentReportEditBody, @Param('id') id: string): Promise<ContentReport> {
		return this.prisma.contentReport.update({
			where: {
				id: BigInt(id),
			},
			data,
		});
	}

	@Delete('report/:id')
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'Delete a content report.' })
	@ApiOkResponse({ description: 'The deleted report.', type: ContentReport })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({
		name: 'id', type: 'number', description: 'User report id', schema: { minimum: 0 },
	})
	async deleteReport(@Param('id') id: string): Promise<ContentReport> {
		return this.prisma.contentReport.delete({
			where: {
				id: BigInt(id),
			},
		});
	}
}
