import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ApiKey } from '@prisma/client';
import { Permission } from './permission.enum';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!requiredPermissions) {
			return true;
		}

		const { user }: { user: ApiKey } = context.switchToHttp().getRequest();
		return requiredPermissions.some((permission) => user.permissions.includes(permission));
	}
}
