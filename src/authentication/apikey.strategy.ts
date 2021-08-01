import { injectable } from '@loopback/core';
import {
	asSpecEnhancer,
	HttpErrors,
	mergeSecuritySchemeToSpec,
	OASEnhancer,
	OpenApiSpec,
	Request,
} from '@loopback/rest';
import {
	asAuthStrategy,
	AuthenticationStrategy,
} from '@loopback/authentication';
import { securityId, UserProfile } from '@loopback/security';
import ApiKey from '../mongodb/models/apiKey';

interface Client {
	id: string;
	key: string;
	owner: string;
	permissions: string[];
}

interface ExtendedClient extends Client, UserProfile {}

@injectable(asAuthStrategy, asSpecEnhancer)
export class ApiKeyAuthenticationStrategy implements AuthenticationStrategy, OASEnhancer {
	name = 'ApiKey';

	constructor() {}

	async authenticate(request: Request): Promise<UserProfile | undefined> {
		const apiKey = this.extractCredentials(request);

		const client = await ApiKey.findOne({ key: apiKey }).lean().exec()
			.catch(() => {
				throw new HttpErrors.InternalServerError('Authentication failure');
			});

		return new Promise((resolve, reject) => {
			if (client) {
				resolve({
					[securityId]: client.key,
					id: client.key,
					...client,
				} as ExtendedClient);
			}
			reject(new HttpErrors.Unauthorized('Invalid API key'));
		});
	}

	// eslint-disable-next-line class-methods-use-this
	extractCredentials(request: Request): string {
		if (!request.get('X-API-KEY')) {
			throw new HttpErrors.Unauthorized('Authentication header not found.');
		}

		return request.get('X-API-KEY')!;
	}

	modifySpec(spec: OpenApiSpec): OpenApiSpec {
		return mergeSecuritySchemeToSpec(spec, this.name, {
			type: 'apiKey',
			in: 'header',
			name: 'X-API-KEY',
		});
	}
}
