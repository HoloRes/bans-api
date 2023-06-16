import {
	CanActivate, ExecutionContext, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as argon2 from 'argon2';
import * as baseX from 'base-x';
import { Buffer } from 'node:buffer';
import { PrismaService } from '../prisma.service';

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const b62 = baseX(BASE62);

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = (request as Request).get('X-API-KEY');

		if (!token) {
			throw new UnauthorizedException();
		}

		const decodedString = Buffer.from(b62.decode(token)).toString('ascii');
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
