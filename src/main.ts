import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

declare global {
	interface BigInt {
		toJSON: () => string;
	}
}

// eslint-disable-next-line func-names,no-extend-native
BigInt.prototype.toJSON = function () {
	return this.toString();
};

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Enable auto-validation
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

	// Helmet
	app.use(helmet());

	app.enableCors();

	// Prisma
	const prismaService = app.get(PrismaService);
	await prismaService.enableShutdownHooks(app);

	// OpenAPI documentation
	const SwaggerConfig = new DocumentBuilder()
		.setTitle('Bans API')
		.setDescription('API for Discord bots in the VTuber sphere to share bans, part of project "Suisei\'s Mic".')
		.setVersion('0.2.1')
		.setContact('GoldElysium', '', 'goldelysium@gmail.com')
		.setLicense('MIT', '')
		.addApiKey({
			name: 'X-API-KEY',
			type: 'apiKey',
			description: 'API key that can be created on the developer dashboard',
			in: 'header',
		}, 'apiKey')
		.addServer('https://bans-api.suisei.app', 'Production')
		.addServer('https://bans-api.staging.suisei.app', 'Testing')
		.addServer('http://localhost:3102', 'Development')
		.build();
	const SwaggerDocument = SwaggerModule.createDocument(app, SwaggerConfig);
	SwaggerModule.setup('docs', app, SwaggerDocument);

	await app.listen(3102);
}
// eslint-disable-next-line no-void
void bootstrap();
