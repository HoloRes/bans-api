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

	/**
	 * @param context AuthorizationContext
	 * @param metadata AuthorizationMetadata
	 * @returns AuthorizationDecision.ALLOW or AuthorizationDecision.DENY
	 *
	 */
	// eslint-disable-next-line class-methods-use-this
	async authorize(
		context: AuthorizationContext,
		metadata: AuthorizationMetadata,
	) {
		if (
			(metadata.scopes?.length ?? -1 > 0)
			&& context.principals[0].permissions.includes('ADMIN')
		) {
			return AuthorizationDecision.ALLOW;
		}

		let allowed = false;

		for (let i = 0; i < (metadata.scopes?.length ?? 0); i++) {
			if (context.principals[0].permissions.includes(metadata.scopes![i])) {
				allowed = true;
				break;
			}
		}

		return allowed ? AuthorizationDecision.ALLOW : AuthorizationDecision.DENY;
	}
}
