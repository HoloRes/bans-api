import { UserProfileFactory } from '@loopback/authentication';
import { StrategyAdapter } from '@loopback/authentication-passport';
import { securityId, UserProfile } from '@loopback/security';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import ApiKey from '../mongodb/models/apiKey';

interface Client {
	key: string;
	owner: string;
	mqEnabled: boolean;
	permissions: string[];
}

interface ExtendedClient extends Client, UserProfile {}

const ClientProfileFactory: UserProfileFactory<Client> = (
	user: Client,
): ExtendedClient => {
	const userProfile = {
		[securityId]: user.key,
		...user,
	};
	return userProfile;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function verify(key: string, done: (error: any, user?: any) => void): void {
	ApiKey.findOne({ key }).lean()
		.then((client) => {
			if (client) {
				done(null, {
					id: client.key,
					...client,
				});
			} else done(null, false);
		}).catch(() => {
			done(true);
		});
}

const bearerStrategy = new BearerStrategy(verify);

export const bearerAuthStrategy = new StrategyAdapter(bearerStrategy, 'bearer', ClientProfileFactory);
