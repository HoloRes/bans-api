import 'dotenv/config';
import mongoose from 'mongoose';
import { ApplicationConfig, BansApiApplication } from './application';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
	const app = new BansApiApplication(options);
	await app.boot();
	await app.start();

	const { url } = app.restServer;
	console.log(`Server is running at ${url}`);
	console.log(`Try ${url}/ping`);

	return app;
}

if (require.main === module) {
	// Connect mongoose
	// eslint-disable-next-line no-void
	void mongoose.connect(process.env.MONGODB_URL ?? 'mongodb://127.0.0.1:27017/bans-api');

	// Run the application
	const config = {
		rest: {
			port: +(process.env.PORT ?? 3000),
			host: process.env.HOST,
			// The `gracePeriodForClose` provides a graceful close for http/https
			// servers with keep-alive clients. The default value is `Infinity`
			// (don't force-close). If you want to immediately destroy all sockets
			// upon stop, set its value to `0`.
			// See https://www.npmjs.com/package/stoppable
			gracePeriodForClose: 5000, // 5 seconds
			openApiSpec: {
				servers: process.env.NODE_ENV === 'production' ? [{ url: 'https://bans.suisei.app' }] : [{ url: 'http://localhost:3000' }],
				// useful when used with OpenAPI-to-GraphQL to locate your application
				setServersFromRequest: false,
				endpointMapping: {
					'/openapi.json': { version: '3.0.0', format: 'json' },
					'/openapi.yaml': { version: '3.0.0', format: 'yaml' },
				},
			},
		},
	};
	main(config).catch((err) => {
		console.error('Cannot start the application.', err);
		process.exit(1);
	});
}

// Sentry Event Frame rewriting
declare global {
	namespace NodeJS {
		interface Global {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			__rootdir__: string;
		}
	}
}

// @ts-expect-error Any type
// eslint-disable-next-line no-underscore-dangle
global.__rootdir__ = __dirname || process.cwd();
