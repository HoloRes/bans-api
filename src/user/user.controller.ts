import {
	Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Query,
} from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiSecurity,
	ApiTags,
} from '@nestjs/swagger';
import { DiscordAPIError } from '@discordjs/rest';
import { Permissions } from '../auth/permissions.decorator';
import { Permission } from '../auth/permission.enum';
import { PrismaService } from '../prisma.service';
import {
	UserFindReports,
	UserReport,
	AddProofBody,
	UserReportCreateBody,
	UserReportEditBody, UserReportInvalidateBody,
	UserReportList,
} from './userreport.dto';
import { DiscordService } from '../discord.service';
import { PublishService } from '../publish.service';

@ApiSecurity('apiKey')
@ApiTags('Users')
@Controller({
	path: 'user',
	version: '1',
})
export class UserController {
	constructor(
		private prisma: PrismaService,
		private discord: DiscordService,
		private publishService: PublishService,
	) {}

	// Public create and edit operations
	@Post('report')
	@Permissions(Permission.Create, Permission.Admin)
	@ApiOperation({ description: 'Create a new user report.' })
	@ApiCreatedResponse({ description: 'The report has been successfully created.', type: UserReport })
	@ApiNotFoundResponse({ description: 'No user was found for the user id or moderator id.' })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	async create(
		@Body() reportData: UserReportCreateBody,
	): Promise<UserReport> {
		try {
			await this.discord.upsertUser(reportData.userId);
		} catch (err: unknown) {
			if (err instanceof DiscordAPIError && err.status === 404) {
				throw new NotFoundException('No Discord user found with the reported user id.');
			}
			throw err;
		}

		try {
			await this.discord.upsertUser(reportData.moderatorId);
		} catch (err: unknown) {
			if (err instanceof DiscordAPIError && err.status === 404) {
				throw new NotFoundException('No Discord user found with the moderator user id.');
			}
			throw err;
		}

		const report = await this.prisma.userReport.create({
			data: reportData,
			include: {
				user: true,
				moderator: true,
			},
		});

		this.publishService.publish('user', 'create', report).then();

		return report;
	}

	@Post('report/:id/proof')
	@HttpCode(200)
	@Permissions(Permission.Create, Permission.Admin)
	@ApiOperation({ description: 'Add additional proof to an existing user report.' })
	@ApiOkResponse({ description: 'The updated report.', type: UserReport })
	@ApiNotFoundResponse({ description: 'No report was found with that id.' })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({
		name: 'id', type: 'number', description: 'User report id', schema: { minimum: 0 },
	})
	async addProof(@Body() data: AddProofBody, @Param('id') id: string): Promise<UserReport> {
		const report = await this.prisma.userReport.findUnique({
			where: {
				id: BigInt(id),
			},
			select: {
				proof: true,
				userId: true,
				moderatorId: true,
			},
		});

		if (!report) {
			throw new NotFoundException();
		}

		try {
			await this.discord.upsertUser(report.userId);
			await this.discord.upsertUser(report.moderatorId);
		} catch { /* empty */ }

		const updatedReport = await this.prisma.userReport.update({
			where: {
				id: BigInt(id),
			},
			data: {
				proof: [...report.proof, ...data.proof],
			},
			include: {
				user: true,
				moderator: true,
			},
		});

		this.publishService.publish('user', 'update', updatedReport).then();

		return updatedReport;
	}

	// Generic find operations
	@Get('list')
	@Permissions(Permission.View, Permission.Create, Permission.Admin)
	@ApiOperation({ description: 'List all the user reports, paginated.' })
	@ApiOkResponse({ description: 'List of reports.', type: UserReportList })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiQuery({
		name: 'offset', type: 'number', allowEmptyValue: true, description: 'Must be 0 or higher.', schema: { minimum: 0 },
	})
	@ApiQuery({
		name: 'limit', type: 'number', allowEmptyValue: true, description: 'Must be between 1 and 250, default is 50.', schema: { minimum: 1, maximum: 250, default: 50 },
	})
	async findAll(@Query('offset') offset = 0, @Query('limit') limit = 50): Promise<UserReportList> {
		const reports = await this.prisma.userReport.findMany({
			skip: Math.max(offset, 0),
			take: Math.min(limit, 250),
			include: {
				user: true,
				moderator: true,
			},
		});

		const reportCount = await this.prisma.userReport.count();

		return {
			reports,
			total: reportCount,
		};
	}

	@Post('find')
	@Permissions(Permission.View, Permission.Create, Permission.Admin)
	@ApiOperation({ description: 'Find user reports using a query.' })
	@ApiOkResponse({ description: 'List of found reports.', type: [UserReport] })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	async find(@Body() query: UserFindReports): Promise<UserReport[]> {
		return this.prisma.userReport.findMany({
			where: query,
			include: {
				user: true,
				moderator: true,
			},
		});
	}

	// Find by id operations
	@Get('report/:id')
	@Permissions(Permission.View, Permission.Create, Permission.Admin)
	@ApiOperation({ description: 'Find a user report by id.' })
	@ApiOkResponse({ description: 'Found report.', type: UserReport })
	@ApiNotFoundResponse({ description: 'No report was found with that id.' })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({
		name: 'id', type: 'number', description: 'User report id', schema: { minimum: 0 },
	})
	async findById(@Param('id') id: string): Promise<UserReport> {
		const report = await this.prisma.userReport.findUnique({
			where: {
				id: BigInt(id),
			},
			include: {
				user: true,
				moderator: true,
			},
		});

		if (!report) {
			throw new NotFoundException('No report found with that id.');
		}

		this.discord.upsertUser(report.userId).catch(undefined);
		this.discord.upsertUser(report.moderatorId).catch(undefined);

		return report;
	}

	@Get('check/:id')
	@Permissions(Permission.View, Permission.Create, Permission.Admin)
	@ApiOperation({ description: 'Find all user reports with the requested user id.' })
	@ApiOkResponse({ description: 'Found reports.', type: [UserReport] })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({ name: 'id', type: 'string', description: 'Discord user id to check' })
	async findByUserId(@Param('id') id: string): Promise<UserReport[]> {
		return this.prisma.userReport.findMany({
			where: {
				userId: id,
			},
			include: {
				user: true,
				moderator: true,
			},
		});
	}

	// Admin operations
	@Patch('report/:id')
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'Update a user report.' })
	@ApiOkResponse({ description: 'The updated report.', type: UserReport })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({
		name: 'id', type: 'number', description: 'User report id', schema: { minimum: 0 },
	})
	async editReport(@Body() data: UserReportEditBody, @Param('id') id: string): Promise<UserReport> {
		const updatedReport = await this.prisma.userReport.update({
			where: {
				id: BigInt(id),
			},
			data,
			include: {
				user: true,
				moderator: true,
			},
		});

		this.publishService.publish('user', 'update', updatedReport).then();

		return updatedReport;
	}

	@Post('report/:id/invalidate')
	@HttpCode(200)
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'Invalidate a user report.' })
	@ApiOkResponse({ description: 'The updated report.', type: UserReport })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({
		name: 'id', type: 'number', description: 'User report id', schema: { minimum: 0 },
	})
	async invalidateReport(@Body() body: UserReportInvalidateBody, @Param('id') id: string): Promise<UserReport> {
		const updatedReport = await this.prisma.userReport.update({
			where: {
				id: BigInt(id),
			},
			data: {
				active: false,
				valid: false,
				...body,
			},
			include: {
				user: true,
				moderator: true,
			},
		});

		this.publishService.publish('user', 'update', updatedReport).then();

		return updatedReport;
	}

	@Post('report/:id/appeal')
	@HttpCode(200)
	@Permissions(Permission.Admin)
	@ApiSecurity('apiKey', ['ADMIN'])
	@ApiOperation({ description: 'Set a user report to the appealed status.' })
	@ApiOkResponse({ description: 'The updated report.', type: UserReport })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({
		name: 'id', type: 'number', description: 'User report id', schema: { minimum: 0 },
	})
	async appealReport(@Body() body: UserReportInvalidateBody, @Param('id') id: string): Promise<UserReport> {
		const updatedReport = await this.prisma.userReport.update({
			where: {
				id: BigInt(id),
			},
			data: {
				active: false,
				appealed: true,
				...body,
			},
			include: {
				user: true,
				moderator: true,
			},
		});

		this.publishService.publish('user', 'update', updatedReport).then();

		return updatedReport;
	}

	@Delete('report/:id')
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'Delete a user report.' })
	@ApiOkResponse({ description: 'The deleted report.', type: UserReport })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({
		name: 'id', type: 'number', description: 'User report id', schema: { minimum: 0 },
	})
	async deleteReport(@Param('id') id: string): Promise<UserReport> {
		const deletedReport = await this.prisma.userReport.delete({
			where: {
				id: BigInt(id),
			},
			include: {
				user: true,
				moderator: true,
			},
		});

		this.publishService.publish('user', 'delete', deletedReport).then();

		return deletedReport;
	}
}
