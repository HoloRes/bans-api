import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { PermissionsGuard } from './auth/permissions.guard';
import { PrismaService } from './prisma.service';
import { UserController } from './user/user.controller';
import { DiscordService } from './discord.service';
import { ContentController } from './content/content.controller';
import { BanlistController } from './user/banlist/banlist.controller';

@Module({
	controllers: [UserController, ContentController, BanlistController],
	providers: [
		PrismaService,
		DiscordService,
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: PermissionsGuard,
		},
	],
})
export class AppModule {}
