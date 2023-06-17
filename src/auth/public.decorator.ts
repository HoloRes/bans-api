import { SetMetadata } from '@nestjs/common';

export const ISPUBLIC_KEY = 'isPublic';
// eslint-disable-next-line max-len
export const IsPublic = () => SetMetadata(ISPUBLIC_KEY, true);
