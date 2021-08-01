import { injectable } from '@loopback/core';
import { Request } from '@loopback/rest';
import {
	asAuthStrategy,
	AuthenticationStrategy,
} from '@loopback/authentication';
import { securityId, UserProfile } from '@loopback/security';

@injectable(asAuthStrategy)
export class NoAuthAuthenticationStrategy implements AuthenticationStrategy {
	name = 'no-auth';

	constructor() {}

	// eslint-disable-next-line class-methods-use-this
	async authenticate(request: Request): Promise<UserProfile | undefined> {
		return {
			[securityId]: request.ip,
			id: request.ip,
			key: request.ip,
			permissions: [],
		};
	}
}
