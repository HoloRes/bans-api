// eslint-disable-next-line max-classes-per-file
import type { UserBanList as PrismaUserBanList } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
	ArrayNotEmpty, IsArray, IsNotEmpty, IsNumberString, IsString, Length,
} from 'class-validator';
import { DiscordUser } from '../userreport.dto';

// POST request body's
export class UserBanListCreateBody {
	@ApiProperty({
		description: 'List of user id\'s.',
		type: [String],
	})
	@IsArray()
	@ArrayNotEmpty()
		users: string[];

	@ApiProperty({
		description: 'Id of the moderator creating the report.',
	})
	@IsNotEmpty()
	@IsString()
	@IsNumberString()
	@Length(18)
		moderatorId: string;

	@ApiProperty({
		description: 'Reason for the report.',
	})
	@IsNotEmpty()
	@IsString()
		reason: string;

	@ApiProperty({
		description: 'List of links to images/files that show proof, optional.',
	})
		proof?: string[];
}

export class UserBanListEditBody {
	@ApiProperty({
		description: 'List of user id\'s.',
		type: [String],
	})
		users?: string[];

	@ApiProperty({
		description: 'Id of the moderator creating the report.',
	})
		moderatorId?: string;

	@ApiProperty({
		description: 'Reason for the report.',
	})
		reason?: string;

	@ApiProperty({
		description: 'List of links to images/files that show proof, optional.',
	})
		proof?: string[];
}

export class UserBanListInvalidateBody {
	@ApiProperty({
		description: 'The reason for invalidating the user report.',
	})
	@IsNotEmpty()
	@IsString()
		invalidateReason: string;
}

// Prisma mappings for responses
export class UserBanList implements PrismaUserBanList {
	@ApiProperty({
		description: 'Id of the ban list.',
	})
		id: string;

	@ApiProperty({
		description: 'List of user id\'s.',
		type: [String],
	})
		users: string[];

	@ApiProperty({
		description: 'Additional information about the moderator',
		type: DiscordUser,
	})
		moderator: DiscordUser;

	@ApiProperty({
		description: 'Id of the moderator creating the report.',
		minLength: 18,
		maxLength: 18,
	})
		moderatorId: string;

	@ApiProperty({
		description: 'Reason for the report.',
	})
		reason: string;

	@ApiProperty({
		description: 'List of links to images/files that show proof.',
	})
		proof: string[];

	@ApiProperty({
		description: 'If the report is valid.',
		example: true,
	})
		valid: boolean;

	@ApiProperty({
		description: 'If the list in invalid, this field will contain the reason why.',
		required: false,
	})
		invalidateReason: string | null;
}

export class UserBanListList {
	@ApiProperty({
		type: [UserBanList],
	})
		lists: PrismaUserBanList[];

	@ApiProperty()
		total: number;
}
