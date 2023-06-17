import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { PermissionsGuard } from './auth/permissions.guard';
import { PrismaService } from './prisma.service';
import { UserController } from './user/user.controller';
import { DiscordService } from './discord.service';
import { ContentController } from './content/content.controller';
import { BanlistController } from './user/banlist/banlist.controller';
import { AdminController } from './admin/admin.controller';
import { RabbitMQService } from './rabbitmq.service';
import { PublishService } from './publish.service';

@Module({
	controllers: [
		UserController,
		ContentController,
		BanlistController,
		AdminController,
	],
	providers: [
		PrismaService,
		DiscordService,
		RabbitMQService,
		PublishService,
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
