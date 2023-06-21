// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import {
	ArrayNotEmpty, IsArray, IsIn, IsNotEmpty, IsNumberString, IsString, IsUrl, Length,
} from 'class-validator';
import { Subscription } from '@prisma/client';
import type { Permission as PrismaPermission } from '@prisma/client';
import { Permission } from '../auth/permission.enum';

// API keys
export class CreateApiKeyBody {
	@ApiProperty({
		description: 'List of permissions',
		type: [String],
		enum: Object.values(Permission),
	})
	@IsArray()
	@ArrayNotEmpty()
		permissions: Permission[];

	@ApiProperty({
		description: 'User friendly name for the API key.',
	})
	@IsNotEmpty()
	@IsString()
		name: string;

	@ApiProperty({
		description: 'Id of the owner.',
	})
	@IsNotEmpty()
	@IsNumberString({ no_symbols: true })
	@Length(18)
		owner: string;
}
export class EditApiKeyBody {
	@ApiProperty({
		description: 'User friendly name for the API key.',
	})
		name?: string;

	@ApiProperty({
		description: 'List of permissions.',
		type: [String],
		enum: Object.values(Permission),
	})
		permissions?: Permission[];
}

export class APIKey {
	@ApiProperty({
		description: 'Id of the API token, username for RabbitMQ.',
	})
		id: string;

	@ApiProperty({
		description: 'User friendly name for the API key.',
	})
		name: string;
}

export class APIKeyWithPermissions extends APIKey {
	@ApiProperty({
		description: 'List of permissions.',
		type: [String],
		enum: Object.values(Permission),
	})
		permissions: PrismaPermission[];
}

export class APIKeyWithKey extends APIKey {
	@ApiProperty({
		description: 'Key to authenticate with.',
	})
		key: string;
}

// Webhook
export class CreateWebhookBody {
	@ApiProperty({
		description: 'URL',
	})
	@IsNotEmpty()
	@IsString()
	@IsUrl()
		url: string;

	@ApiProperty({
		description: 'User friendly name.',
	})
	@IsNotEmpty()
	@IsString()
		name: string;

	@ApiProperty({
		description: 'Id of the owner.',
	})
	@IsNotEmpty()
	@IsNumberString({ no_symbols: true })
	@Length(18)
		owner: string;

	@ApiProperty({
		description: 'List of subscriptions.',
		type: [String],
		enum: Object.values(Subscription),
	})
	@IsArray()
	@ArrayNotEmpty()
		subscriptions: Subscription[];
}

export class EditWebhookBody {
	@ApiProperty({
		description: 'URL',
	})
		url?: string;

	@ApiProperty({
		description: 'User friendly name.',
	})
		name?: string;

	@ApiProperty({
		description: 'If the webhook is disabled.',
	})
		disabled?: boolean;

	@ApiProperty({
		description: 'List of subscriptions.',
		type: [String],
		enum: Object.values(Subscription),
	})
		subscriptions?: Subscription[];
}

export class Webhook {
	@ApiProperty({
		description: 'Id of the webhook.',
	})
		id: string;

	@ApiProperty({
		description: 'URL',
	})
		url: string;

	@ApiProperty({
		description: 'If the webhook is disabled.',
	})
		disabled: boolean;

	@ApiProperty({
		description: 'User friendly name.',
	})
		name: string;

	@ApiProperty({
		description: 'List of subscriptions.',
		type: [String],
		enum: Object.values(Subscription),
	})
		subscriptions: Subscription[];
}

export class WebhookSecret {
	@ApiProperty({
		description: 'Id of the webhook.',
	})
		id: string;

	@ApiProperty({
		description: 'Secret for verifying messages.',
	})
		secret: string;
}

// RabbitMQ
export class RMQUserAuthBody {
	@ApiProperty({
		description: 'Username',
	})
	@IsNotEmpty()
	@IsString()
		username: string;

	@ApiProperty({
		description: 'Password (API key)',
	})
	@IsNotEmpty()
	@IsString()
		password: string;
}

export class RMQVHostBody {
	@ApiProperty({
		description: 'Username',
	})
	@IsNotEmpty()
	@IsString()
		username: string;

	@ApiProperty({
		description: 'Virtual host name',
	})
	@IsNotEmpty()
	@IsString()
		vhost: string;

	@ApiProperty({
		description: 'Connecting ip',
	})
	@IsNotEmpty()
	@IsString()
		ip: string;
}

export class RMQResourceBody {
	@ApiProperty({
		description: 'Username',
	})
	@IsNotEmpty()
	@IsString()
		username: string;

	@ApiProperty({
		description: 'Virtual host name',
	})
	@IsNotEmpty()
	@IsString()
		vhost: string;

	@ApiProperty({
		description: 'Resource',
	})
	@IsNotEmpty()
	@IsString()
		resource: string;

	@ApiProperty({
		description: 'Resource name',
	})
	@IsNotEmpty()
	@IsString()
		name: string;

	@ApiProperty({
		description: 'Permission',
		enum: ['configure', 'write', 'read'],
	})
	@IsNotEmpty()
	@IsString()
	@IsIn(['configure', 'write', 'read'])
		permission: 'configure' | 'write' | 'read';
}

export class RMQTopicBody {
	@ApiProperty({
		description: 'Username',
	})
	@IsNotEmpty()
	@IsString()
		username: string;

	@ApiProperty({
		description: 'Virtual host name',
	})
	@IsNotEmpty()
	@IsString()
		vhost: string;

	@ApiProperty({
		description: 'Resource',
	})
	@IsNotEmpty()
	@IsString()
	@IsIn(['topic'])
		resource: 'topic';

	@ApiProperty({
		description: 'Resource name',
	})
	@IsNotEmpty()
	@IsString()
		name: string;

	@ApiProperty({
		description: 'Permission',
		enum: ['write', 'read'],
	})
	@IsNotEmpty()
	@IsString()
	@IsIn(['write', 'read'])
		permission: 'write' | 'read';

	@ApiProperty({
		description: 'Routing key',
	})
	@IsNotEmpty()
	@IsString()
		routing_key: string;
}
