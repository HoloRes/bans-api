import {
	CanActivate, ExecutionContext, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as argon2 from 'argon2';
import * as baseX from 'base-x';
import { Buffer } from 'node:buffer';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma.service';
import BASE62 from '../lib/base62';

@Injectable()
export class AuthGuard implements CanActivate {
	private readonly b62 = baseX(BASE62);

	constructor(private prisma: PrismaService, private readonly reflector: Reflector) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.get<boolean>(
			'isPublic',
			context.getHandler(),
		);

		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const token = (request as Request).get('X-API-KEY');

		if (!token) {
			throw new UnauthorizedException();
		}

		const decodedString = Buffer.from(this.b62.decode(token)).toString('ascii');
		const splitToken = decodedString.split('.');
		if (splitToken.length !== 2) {
			throw new UnauthorizedException();
		}

		const apiKey = await this.prisma.apiKey.findUnique({
			where: {
				id: splitToken[0],
			},
		});
		if (!apiKey) {
			throw new UnauthorizedException();
		}

		if (await argon2.verify(apiKey.key, splitToken[1])) {
			request.user = apiKey;
		} else {
			throw new UnauthorizedException();
		}

		return true;
	}
}
