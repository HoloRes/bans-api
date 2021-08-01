import {
	AuthenticationComponent,
	registerAuthenticationStrategy,
} from '@loopback/authentication';
import {
	AuthorizationBindings, AuthorizationComponent, AuthorizationDecision, AuthorizationTags,
} from '@loopback/authorization';
import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import {
	RestExplorerBindings,
	RestExplorerComponent,
} from '@loopback/rest-explorer';
import { ServiceMixin } from '@loopback/service-proxy';
import Express from 'express';
import { RateLimiterComponent, RateLimitSecurityBindings } from 'loopback4-ratelimiter';
import path from 'path';
import { AuthorizationProvider } from './authentication/authorizer.provider';
import { ApiKeyAuthenticationStrategy } from './authentication/apikey.strategy';
import { NoAuthAuthenticationStrategy } from './authentication/noauth.strategy';
import apiKey from './mongodb/models/apiKey';
import { MySequence } from './sequence';

export { ApplicationConfig };

export class BansApiApplication extends BootMixin(
	ServiceMixin(RepositoryMixin(RestApplication)),
) {
	constructor(options: ApplicationConfig = {}) {
		super(options);

		// Rate limiter
		this.component(RateLimiterComponent);
		this.bind(RateLimitSecurityBindings.CONFIG).to({
			name: 'redis',
			type: 'RedisStore',
			max: async (req: Express.Request) => {
				const client = await apiKey.findOne({ key: req.get('X-API-KEY') }).lean().exec();
				return client ? 300 : 120;
			},
			keyGenerator: async (req: Express.Request) => {
				const client = await apiKey.findOne({ key: req.get('X-API-KEY') }).lean().exec();
				return client ? client.key : req.ip;
			},
		});

		// Authentication
		this.component(AuthenticationComponent);

		registerAuthenticationStrategy(this, ApiKeyAuthenticationStrategy);
		registerAuthenticationStrategy(this, NoAuthAuthenticationStrategy);

		// Authorization
		this.configure(AuthorizationBindings.COMPONENT).to({
			precedence: AuthorizationDecision.DENY,
			defaultDecision: AuthorizationDecision.DENY,
		});
		this.component(AuthorizationComponent);
		this.bind('authorizationProviders.authorizer-provider')
			.toProvider(AuthorizationProvider)
			.tag(AuthorizationTags.AUTHORIZER);

		// Set up the custom sequence
		this.sequence(MySequence);

		// Set up default home page
		this.static('/', path.join(__dirname, '../public'));

		// Customize @loopback/rest-explorer configuration here
		this.configure(RestExplorerBindings.COMPONENT).to({
			path: '/explorer',
		});
		this.component(RestExplorerComponent);

		this.projectRoot = __dirname;
		// Customize @loopback/boot Booter Conventions here
		this.bootOptions = {
			controllers: {
				// Customize ControllerBooter Conventions here
				dirs: ['controllers'],
				extensions: ['.controller.js'],
				nested: true,
			},
		};
	}
}
