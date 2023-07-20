// eslint-disable-next-line max-classes-per-file
import type { UserReport as PrismaUserReport, DiscordUser as PrismaDiscordUser } from '@prisma/client';
import { UserReportType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
	ArrayNotEmpty,
	IsArray, IsBoolean,
	IsIn, IsNotEmpty, IsNumberString, IsOptional, IsString, Length,
} from 'class-validator';

// POST request body's
export class UserReportCreateBody {
	@ApiProperty({
		description: 'Id of the reported user.',
	})
	@IsNotEmpty()
	@IsNumberString({ no_symbols: true })
	@Length(18)
		userId: string;

	@ApiProperty({
		description: 'Id of the moderator creating the report.',
	})
	@IsNotEmpty()
	@IsNumberString({ no_symbols: true })
	@Length(18)
		moderatorId: string;

	@ApiProperty({
		description: 'The type of the user report.',
		enum: Object.values(UserReportType),
	})
	@IsNotEmpty()
	@IsString()
	@IsIn(Object.values(UserReportType))
		type: UserReportType;

	@ApiProperty({
		description: 'Reason for the report.',
	})
	@IsNotEmpty()
	@IsString()
		reason: string;

	@ApiProperty({
		description: 'List of links to images/files that show proof, optional.',
	})
	@IsOptional()
	@IsArray()
		proof?: string[];
}
export class UserReportEditBody {
	@ApiProperty({
		description: 'Id of the reported user.',
	})
	@IsOptional()
	@IsNotEmpty()
	@IsNumberString({ no_symbols: true })
	@Length(18)
		userId?: string;

	@ApiProperty({
		description: 'Id of the moderator creating the report.',
	})
	@IsOptional()
	@IsNotEmpty()
	@IsNumberString({ no_symbols: true })
	@Length(18)
		moderatorId?: string;

	@ApiProperty({
		description: 'The type of the user report.',
		enum: Object.values(UserReportType),
	})
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@IsIn(Object.values(UserReportType))
		type?: UserReportType;

	@ApiProperty({
		description: 'Reason for the report.',
	})
	@IsOptional()
	@IsNotEmpty()
	@IsString()
		reason?: string;

	@ApiProperty({
		description: 'List of links to images/files that show proof, optional.',
	})
	@IsOptional()
	@IsArray()
		proof?: string[];
}

export class AddProofBody {
	@ApiProperty({
		description: 'List of links to images/files that show proof.',
		type: [String],
	})
	@IsArray()
	@ArrayNotEmpty()
		proof: string[];
}

export class UserReportInvalidateBody {
	@ApiProperty({
		description: 'The reason for invalidating the user report.',
	})
	@IsNotEmpty()
	@IsString()
		inactiveReason: string;
}

// Prisma mappings for responses
export class DiscordUser implements PrismaDiscordUser {
	@ApiProperty({
		description: 'Id of the user.',
		minLength: 18,
		maxLength: 18,
	})
		id: string;

	@ApiProperty({
		description: 'Last known username of the user by the API.',
	})
		lastKnownUsername: string;

	@ApiProperty({
		description: 'List of all the known previous usernames by the API.',
	})
		pastUsernames: string[];
}

export class UserReport implements PrismaUserReport {
	@ApiProperty({
		description: 'Id of the report.',
	})
		id: bigint;

	@ApiProperty({
		description: 'Additional information about the user.',
		type: DiscordUser,
	})
		user: DiscordUser;

	@ApiProperty({
		description: 'Id of the reported user.',
		minLength: 18,
		maxLength: 18,
	})
		userId: string;

	@ApiProperty({
		description: 'Additional information about the moderator.',
		type: DiscordUser,
	})
		moderator: DiscordUser;

	@ApiProperty({
		description: 'Id of the moderator who created the report.',
		minLength: 18,
		maxLength: 18,
	})
		moderatorId: string;

	@ApiProperty({
		description: 'The type of the user report.',
		enum: ['NORMAL', 'COMPROMISED'],
	})
		type: UserReportType;

	@ApiProperty({
		description: 'Reason for the report.',
	})
		reason: string;

	@ApiProperty({
		description: 'List of links to images/files that show proof.',
	})
		proof: string[];

	@ApiProperty({
		description: 'AND of valid and appealed properties.',
		example: true,
	})
		active: boolean;

	@ApiProperty({
		description: 'If the report is valid.',
		example: true,
	})
		valid: boolean;

	@ApiProperty({
		description: 'If the report has been successfully appealed.',
		example: false,
	})
		appealed: boolean;

	@ApiProperty({
		description: 'If the report is inactive, this field will contain the reason why.',
		required: false,
	})
		inactiveReason: string | null;
}

export class UserFindReports {
	@ApiProperty({
		description: 'Id of the reported user.',
	})
	@IsOptional()
	@IsNotEmpty()
	@IsNumberString({ no_symbols: true })
	@Length(18)
		userId?: string;

	@ApiProperty({
		description: 'Id of the moderator who created the report.',
	})
	@IsOptional()
	@IsNotEmpty()
	@IsNumberString({ no_symbols: true })
	@Length(18)
		moderatorId?: string;

	@ApiProperty({
		description: 'The type of the user report.',
		enum: Object.values(UserReportType),
	})
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@IsIn(Object.values(UserReportType))
		type?: UserReportType;

	@ApiProperty({
		description: 'AND of valid and appealed properties.',
		example: true,
	})
	@IsOptional()
	@IsNotEmpty()
	@IsBoolean()
		active?: boolean;

	@ApiProperty({
		description: 'If the report is valid.',
		example: true,
	})
	@IsOptional()
	@IsNotEmpty()
	@IsBoolean()
		valid?: boolean;

	@ApiProperty({
		description: 'If the report has been successfully appealed.',
		example: false,
	})
	@IsOptional()
	@IsNotEmpty()
	@IsBoolean()
		appealed?: boolean;
}

export class UserReportList {
	@ApiProperty({
		type: [UserReport],
	})
		reports: PrismaUserReport[];

	@ApiProperty()
		total: number;
}
