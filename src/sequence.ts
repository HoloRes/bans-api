import {
	AuthenticateFn,
	AuthenticationBindings,
	AUTHENTICATION_STRATEGY_NOT_FOUND,
	USER_PROFILE_NOT_FOUND,
} from '@loopback/authentication';
import { inject } from '@loopback/core';
import {
	ExpressRequestHandler,
	FindRoute,
	InvokeMethod,
	InvokeMiddleware,
	ParseParams,
	Reject,
	RequestContext,
	Send,
	SequenceActions,
	SequenceHandler,
} from '@loopback/rest';
import helmet from 'helmet';
import { RateLimitAction, RateLimitSecurityBindings } from 'loopback4-ratelimiter';

const middlewareList: ExpressRequestHandler[] = [
	helmet({ contentSecurityPolicy: false }),
];

export class MySequence implements SequenceHandler {
	constructor(
		@inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
		@inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
		@inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
		@inject(SequenceActions.SEND) public send: Send,
		@inject(SequenceActions.REJECT) public reject: Reject,
		@inject(SequenceActions.INVOKE_MIDDLEWARE) protected invokeMiddleware: InvokeMiddleware,
		@inject(RateLimitSecurityBindings.RATELIMIT_SECURITY_ACTION)
		protected rateLimitAction: RateLimitAction,
		@inject(AuthenticationBindings.AUTH_ACTION)
		protected authenticateRequest: AuthenticateFn,
	) {}

	async handle(context: RequestContext): Promise<void> {
		try {
			const { request, response } = context;
			// `this.invokeMiddleware` is an injected function to invoke a list of
			// Express middleware handler functions
			const finished = await this.invokeMiddleware(context, middlewareList);
			if (finished) {
				// The http response has already been produced by one of the Express
				// middleware. We should not call further actions.
				return;
			}
			const route = this.findRoute(request);
			await this.authenticateRequest(request);

			const args = await this.parseParams(request, route);

			await this.rateLimitAction(request, response);

			const result = await this.invoke(route, args);

			this.send(response, result);
		} catch (error) {
			if (
				error.code === AUTHENTICATION_STRATEGY_NOT_FOUND
				|| error.code === USER_PROFILE_NOT_FOUND
			) {
				Object.assign(error, { statusCode: 401 });
			}

			this.reject(context, error);
		}
	}
}
