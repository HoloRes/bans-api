import {
	Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query,
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
import * as crypto from 'node:crypto';
import * as baseX from 'base-x';
import * as argon2 from 'argon2';
import { Buffer } from 'node:buffer';
import { Permission } from '../auth/permission.enum';
import { Permissions } from '../auth/permissions.decorator';
import { PrismaService } from '../prisma.service';
import {
	APIKeyWithKey,
	APIKeyWithPermissions,
	CreateApiKeyBody,
	CreateWebhookBody,
	EditApiKeyBody,
	EditWebhookBody,
	RMQResourceBody,
	RMQTopicBody,
	RMQUserAuthBody,
	RMQVHostBody,
	Webhook,
	WebhookSecret,
} from './admin.dto';
import BASE62 from '../lib/base62';
import { IsPublic } from '../auth/public.decorator';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
	private readonly b62 = baseX(BASE62);

	constructor(private prisma: PrismaService) {}

	// API key routes
	@Post('apikey/create')
	@ApiSecurity('apiKey', [Permission.Admin])
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'Create a new API key.' })
	@ApiCreatedResponse({ description: 'The created API key.', type: APIKeyWithKey })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	async createApiKey(@Body() data: CreateApiKeyBody): Promise<APIKeyWithKey> {
		const id = crypto.randomBytes(8).toString('hex');
		const secret = crypto.randomBytes(16).toString('hex');

		const key = `${id}.${secret}`;
		const hashedKey = await argon2.hash(secret);

		await this.prisma.apiKey.create({
			data: {
				id,
				key: hashedKey,
				...data,
			},
		});

		return {
			id,
			name: data.name,
			key: this.b62.encode(Buffer.from(key, 'ascii')),
		};
	}

	@Patch('apikey/:id')
	@ApiSecurity('apiKey', [Permission.Admin])
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'Update an API key.' })
	@ApiOkResponse({ description: 'The updated API key.', type: APIKeyWithPermissions })
	@ApiNotFoundResponse({ description: 'No API key found with that id.' })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({ name: 'id', description: 'Id of the API key.' })
	async editApiKey(
		@Body() data: EditApiKeyBody,
			@Param() id: string,
	): Promise<APIKeyWithPermissions> {
		return this.prisma.apiKey.update({
			where: {
				id,
			},
			data,
			select: {
				id: true,
				name: true,
				permissions: true,
			},
		});
	}

	@Post('apikey/:id/rollover')
	@ApiSecurity('apiKey', [Permission.Admin])
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'Update an API key.' })
	@ApiOkResponse({ description: 'The updated API key.', type: APIKeyWithKey })
	@ApiNotFoundResponse({ description: 'No API key found with that id.' })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({ name: 'id', description: 'Id of the API key.' })
	async rollOverApiKey(@Param() id: string): Promise<APIKeyWithKey> {
		const secret = crypto.randomBytes(16).toString('hex');

		const key = `${id}.${secret}`;
		const hashedKey = await argon2.hash(secret);

		const updatedApiKey = await this.prisma.apiKey.update({
			where: {
				id,
			},
			data: {
				key: hashedKey,
			},
		});

		return {
			id,
			name: updatedApiKey.name,
			key: this.b62.encode(Buffer.from(key, 'ascii')),
		};
	}

	@Delete('apikey/:id')
	@ApiSecurity('apiKey', [Permission.Admin])
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'Delete an API key.' })
	@ApiOkResponse({ description: 'The API key has been deleted.' })
	@ApiNotFoundResponse({ description: 'No API key found with that id.' })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({ name: 'id', description: 'Id of the API key.' })
	async deleteApiKey(@Param() id: string): Promise<void> {
		await this.prisma.apiKey.delete({
			where: {
				id,
			},
		});
	}

	@Get('apikey/list')
	@ApiSecurity('apiKey', [Permission.Admin])
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'List API keys by owner.' })
	@ApiOkResponse({ description: 'List of API keys.', type: [APIKeyWithPermissions] })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiQuery({ name: 'owner', description: 'Owner to search for.' })
	async listApiKeysByOwner(@Query() owner: string): Promise<APIKeyWithPermissions[]> {
		return this.prisma.apiKey.findMany({
			where: {
				owner,
			},
			select: {
				id: true,
				name: true,
				permissions: true,
			},
		});
	}

	// Webhook routes
	@Post('webhook/create')
	@ApiSecurity('apiKey', [Permission.Admin])
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'Create a new webhook.' })
	@ApiCreatedResponse({ description: 'The created webhook.', type: WebhookSecret })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	async createWebhook(@Body() data: CreateWebhookBody): Promise<WebhookSecret> {
		const secret = crypto.randomBytes(32).toString('hex');

		const webhook = await this.prisma.webhook.create({
			data: {
				...data,
				secret,
			},
		});

		return {
			id: webhook.id,
			secret,
		};
	}

	@Patch('webhook/:id')
	@ApiSecurity('apiKey', [Permission.Admin])
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'Update a webhook.' })
	@ApiOkResponse({ description: 'The updated webhook.', type: Webhook })
	@ApiNotFoundResponse({ description: 'No webhook found with that id.' })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({ name: 'id', description: 'Id of the webhook.' })
	async editWebhook(@Body() data: EditWebhookBody, @Param() id: string): Promise<Webhook> {
		return this.prisma.webhook.update({
			where: {
				id,
			},
			data,
			select: {
				id: true,
				url: true,
				name: true,
				disabled: true,
				subscriptions: true,
			},
		});
	}

	@Post('webhook/:id/rollover')
	@ApiSecurity('apiKey', [Permission.Admin])
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'Rollover webhook secret.' })
	@ApiOkResponse({ description: 'The new secret.', type: WebhookSecret })
	@ApiNotFoundResponse({ description: 'No webhook found with that id.' })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({ name: 'id', description: 'Id of the webhook.' })
	async rollOverWebhookSecret(@Param() id: string): Promise<WebhookSecret> {
		const secret = crypto.randomBytes(32).toString('hex');

		await this.prisma.webhook.update({
			where: {
				id,
			},
			data: {
				secret,
			},
		});

		return {
			id,
			secret,
		};
	}

	@Delete('webhook/:id')
	@ApiSecurity('apiKey', [Permission.Admin])
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'Delete a webhook.' })
	@ApiOkResponse({ description: 'The webhook has been deleted.' })
	@ApiNotFoundResponse({ description: 'No webhook found with that id.' })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiParam({ name: 'id', description: 'Id of the webhook.' })
	async deleteWebhook(@Param() id: string): Promise<void> {
		await this.prisma.webhook.delete({
			where: {
				id,
			},
		});
	}

	@Get('webhook/list')
	@ApiSecurity('apiKey', [Permission.Admin])
	@Permissions(Permission.Admin)
	@ApiOperation({ description: 'List webhooks by owner.' })
	@ApiOkResponse({ description: 'List of webhooks.', type: [Webhook] })
	@ApiForbiddenResponse({ description: 'Forbidden.' })
	@ApiQuery({ name: 'owner', description: 'Owner to search for.' })
	async listWebhooksByOwner(@Query() owner: string): Promise<Webhook[]> {
		return this.prisma.webhook.findMany({
			where: {
				owner,
			},
			select: {
				id: true,
				url: true,
				name: true,
				disabled: true,
				subscriptions: true,
			},
		});
	}

	// RabbitMQ routes
	@Post('rmq/user')
	@HttpCode(200)
	@IsPublic()
	@ApiOperation({ description: 'RabbitMQ endpoint to verify credentials' })
	@ApiOkResponse({ description: 'OK', type: String })
	async authUser(@Body() body: RMQUserAuthBody): Promise<string> {
		const decodedString = Buffer.from(this.b62.decode(body.password)).toString('ascii');
		const splitToken = decodedString.split('.');
		if (splitToken.length !== 2 || splitToken[0] !== body.username) {
			return 'deny';
		}

		const token = await this.prisma.apiKey.findUnique({
			where: {
				id: splitToken[0],
			},
		});

		if (!token) return 'deny';

		if (await argon2.verify(token.key, splitToken[1])) {
			if (token.permissions.includes(Permission.Admin)) {
				return 'allow administrator management';
			}
			return 'allow';
		}

		return 'deny';
	}

	@Post('rmq/vhost')
	@HttpCode(200)
	@IsPublic()
	@ApiOperation({ description: 'RabbitMQ endpoint to check vhost access' })
	@ApiOkResponse({ description: 'OK', type: String })
	async authVHost(@Body() body: RMQVHostBody): Promise<'deny' | 'allow'> {
		const token = await this.prisma.apiKey.findUnique({
			where: {
				id: body.username,
			},
		});

		if (!token) return 'deny';

		return 'allow';
	}

	@Post('rmq/resource')
	@HttpCode(200)
	@IsPublic()
	@ApiOperation({ description: 'RabbitMQ endpoint to check resource access' })
	@ApiOkResponse({ description: 'OK', type: String })
	async authResource(@Body() body: RMQResourceBody): Promise<'deny' | 'allow'> {
		const token = await this.prisma.apiKey.findUnique({
			where: {
				id: body.username,
			},
		});

		if (!token) return 'deny';

		if (body.resource === 'queue') return 'allow';

		if (body.permission !== 'read' && !token.permissions.includes(Permission.Admin)) return 'deny';

		return 'allow';
	}

	@Post('rmq/topic')
	@HttpCode(200)
	@IsPublic()
	@ApiOperation({ description: 'RabbitMQ endpoint to check topic access' })
	@ApiOkResponse({ description: 'OK', type: String })
	async authTopic(@Body() body: RMQTopicBody): Promise<'deny' | 'allow'> {
		const token = await this.prisma.apiKey.findUnique({
			where: {
				id: body.username,
			},
		});

		if (!token) return 'deny';

		if (body.permission !== 'read' && !token.permissions.includes(Permission.Admin)) return 'deny';

		if (body.name !== 'bans-api') return 'deny';

		return 'allow';
	}
}
