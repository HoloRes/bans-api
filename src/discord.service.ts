import { Injectable, OnModuleInit } from '@nestjs/common';
import { REST } from '@discordjs/rest';
import { APIUser, Routes } from 'discord-api-types/v10';
import { PrismaService } from './prisma.service';

@Injectable()
export class DiscordService extends REST implements OnModuleInit {
	constructor(private prisma: PrismaService) {
		super({ version: '10' });
	}

	async onModuleInit() {
		if (!process.env.DISCORD_TOKEN) {
			throw new Error('Cannot find DISCORD_TOKEN in env');
		}

		await this.setToken(process.env.DISCORD_TOKEN);
	}

	/**
	 * Function to upsert known Discord user data in the database
	 * @param id - Discord user id to upsert
	 * @internal
	 * */
	async upsertUser(id: string) {
		const user = await this.get(Routes.user(id)) as APIUser;

		const prismaUser = await this.prisma.discordUser.findUnique({
			where: {
				id,
			},
			select: {
				lastKnownUsername: true,
				pastUsernames: true,
			},
		});

		const newList = [...(prismaUser?.pastUsernames ?? [])];
		if (!newList.includes(user.username)) {
			newList.push(user.username);
		}

		this.prisma.discordUser.upsert({
			where: {
				id,
			},
			create: {
				id,
				lastKnownUsername: user.username,
				pastUsernames: newList,
			},
			update: {
				lastKnownUsername:
					prismaUser?.lastKnownUsername === user.username ? undefined : user.username,
				pastUsernames: newList,
			},

		});
	}
}
