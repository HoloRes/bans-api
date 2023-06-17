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
import { PrismaService } from '../../prisma.service';
import { Permissions } from '../../auth/permissions.decorator';
import { Permission } from '../../auth/permission.enum';
import {
	UserBanList,
	UserBanListCreateBody,
	UserBanListEditBody,
	UserBanListInvalidateBody,
	UserBanListList,
} from './banlist.dto';
import { DiscordService } from '../../discord.service';
import { AddProofBody } from '../userreport.dto';

@ApiTags('User ban lists')
@ApiSecurity('apiKey')
@Controller('user/banlist')
export class BanlistController {
	constructor(private prisma: PrismaService, private discord: DiscordService) {}

	// Public create and edit operations
	@Post('create')
	@Permissions(Permission.Create, Permission.Admin)
	@ApiOperation({ description: 'Create a new user ban list' })
	@ApiCreatedResponse({ description: 'The ban list has been successfully created.', type: UserBanList })
	@ApiNotFoundResponse({ description: 'No user was found for the moderator id.' })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	async create(@Body() data: UserBanListCreateBody): Promise<UserBanList> {
		try {
			await this.discord.upsertUser(data.moderatorId);
		} catch (err: unknown) {
			if (err instanceof DiscordAPIError && err.status === 404) {
				throw new NotFoundException('No Discord user found with the moderator user id.');
			}
			throw err;
		}

		return this.prisma.userBanList.create({
			data,
			include: {
				moderator: true,
			},
		});
	}

	@Post(':id/proof')
	@HttpCode(200)
	@Permissions(Permission.Create, Permission.Admin)
	@ApiOperation({ description: 'Add additional proof to an existing ban list.' })
	@ApiOkResponse({ description: 'The updated ban list.', type: UserBanList })
	@ApiNotFoundResponse({ description: 'No ban list was found with that id.' })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({ name: 'id', description: 'Ban list id' })
	async addProof(@Body() data: AddProofBody, @Param('id') id: string): Promise<UserBanList> {
		const banList = await this.prisma.userBanList.findUnique({
			where: {
				id,
			},
			select: {
				proof: true,
				moderatorId: true,
			},
		});

		if (!banList) {
			throw new NotFoundException();
		}

		try {
			await this.discord.upsertUser(banList.moderatorId);
		} catch { /* empty */ }

		return this.prisma.userBanList.update({
			where: {
				id,
			},
			data: {
				proof: [...banList.proof, ...data.proof],
			},
			include: {
				moderator: true,
			},
		});
	}

	// Generic find operations
	@Get('list')
	@Permissions(Permission.View, Permission.Create, Permission.Admin)
	@ApiOperation({ description: 'List all the ban lists, paginated.' })
	@ApiOkResponse({ description: 'List of ban lists.', type: UserBanListList })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiQuery({
		name: 'offset', type: 'number', allowEmptyValue: true, description: 'Must be 0 or higher.', schema: { minimum: 0 },
	})
	@ApiQuery({
		name: 'limit', type: 'number', allowEmptyValue: true, description: 'Must be between 1 and 250, default is 50.', schema: { minimum: 1, maximum: 250, default: 50 },
	})
	async findAll(@Query('offset') offset = 0, @Query('limit') limit = 50): Promise<UserBanListList> {
		const banLists = await this.prisma.userBanList.findMany({
			skip: Math.max(offset, 0),
			take: Math.min(limit, 250),
			include: {
				moderator: true,
			},
		});

		const banListCount = await this.prisma.userBanList.count();

		return {
			lists: banLists,
			total: banListCount,
		};
	}

	@Get(':id')
	@Permissions(Permission.View, Permission.Create, Permission.Admin)
	@ApiOperation({ description: 'Find a ban list by id.' })
	@ApiOkResponse({ description: 'Found ban list.', type: UserBanList })
	@ApiNotFoundResponse({ description: 'No ban list was found with that id.' })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({ name: 'id', description: 'Ban list id' })
	async findById(@Param('id') id: string): Promise<UserBanList> {
		const banList = await this.prisma.userBanList.findUnique({
			where: {
				id,
			},
			include: {
				moderator: true,
			},
		});

		if (!banList) {
			throw new NotFoundException('No ban list found with that id.');
		}

		this.discord.upsertUser(banList.moderatorId).catch(undefined);

		return banList;
	}

	@Get('search')
	@Permissions(Permission.View, Permission.Create, Permission.Admin)
	@ApiOperation({ description: 'Finds all ban lists containing the query using full text search.' })
	@ApiQuery({
		name: 'query', type: 'string', description: 'String to search for',
	})
	@ApiQuery({
		name: 'caseInsensitive', type: 'boolean', description: 'Disable case sensitivity.', allowEmptyValue: true, schema: { default: false },
	})
	async search(@Query('query') query: string, @Query('caseInsensitive') caseInsensitive = false): Promise<UserBanList[]> {
		return this.prisma.userBanList.findMany({
			where: {
				reason: {
					search: query,
					mode: caseInsensitive ? 'insensitive' : 'default',
				},
			},
			include: {
				moderator: true,
			},
		});
	}

	// Admin operations
	@Patch(':id')
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'Update a ban list' })
	@ApiOkResponse({ description: 'The updated ban list.', type: UserBanList })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({ name: 'id', description: 'Ban list id' })
	async editBanList(@Body() data: UserBanListEditBody, @Param('id') id: string): Promise<UserBanList> {
		return this.prisma.userBanList.update({
			where: {
				id,
			},
			data,
			include: {
				moderator: true,
			},
		});
	}

	@Post(':id/invalidate')
	@HttpCode(200)
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'Invalidate a ban list.' })
	@ApiOkResponse({ description: 'The updated ban list.', type: UserBanList })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({ name: 'id', description: 'Ban list id' })
	async invalidateBanList(@Body() body: UserBanListInvalidateBody, @Param('id') id: string): Promise<UserBanList> {
		return this.prisma.userBanList.update({
			where: {
				id,
			},
			data: {
				valid: false,
				...body,
			},
			include: {
				moderator: true,
			},
		});
	}

	@Delete(':id')
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'Delete a user ban list.' })
	@ApiOkResponse({ description: 'The deleted ban list.', type: UserBanList })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({ name: 'id', description: 'Ban list id' })
	async deleteBanList(@Param('id') id: string): Promise<UserBanList> {
		return this.prisma.userBanList.delete({
			where: {
				id,
			},
			include: {
				moderator: true,
			},
		});
	}
}
