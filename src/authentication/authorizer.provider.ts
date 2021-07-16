import {
	AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer,
} from '@loopback/authorization';
import { Provider } from '@loopback/core';

export class AuthorizationProvider implements Provider<Authorizer> {
	/**
	 * @returns an authorizer function
	 *
	 */
	value(): Authorizer {
		return this.authorize.bind(this);
	}

	// eslint-disable-next-line class-methods-use-this
	async authorize(
		context: AuthorizationContext,
		metadata: AuthorizationMetadata,
	) {
		if (
			(metadata.scopes?.includes('ADMIN') || metadata.scopes?.includes('CREATE'))
			&& context.principals[0].permissions.includes('ADMIN')
		) {
			return AuthorizationDecision.ALLOW;
		}

		if (
			(metadata.scopes?.includes('CREATE'))
			&& context.principals[0].permissions.includes('CREATE')
		) {
			return AuthorizationDecision.ALLOW;
		}
		return AuthorizationDecision.DENY;
	}
}
