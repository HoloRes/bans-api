import mongoose from 'mongoose';

export interface IApiKey {
	key: string;
	owner: string;
	mqEnabled: boolean;
	permissions: string[];
}

const ApiKeySchema = new mongoose.Schema({
	key: { type: String, required: true },
	owner: { type: String, required: true },
	mqEnabled: { type: Boolean, default: false },
	permissions: { type: Array, default: [] },
});

export default mongoose.model<IApiKey>('ApiKey', ApiKeySchema, 'apikeys');
