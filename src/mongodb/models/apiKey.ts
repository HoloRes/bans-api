import mongoose from 'mongoose';
import mongooseHidden from 'mongoose-hidden';

export interface IApiKey {
	key: string;
	owner: string;
	permissions: string[];
}

const ApiKeySchema = new mongoose.Schema({
	key: { type: String, required: true },
	owner: { type: String, required: true },
	permissions: { type: Array, default: [] },
});
ApiKeySchema.plugin(mongooseHidden());

export default mongoose.model<IApiKey>('ApiKey', ApiKeySchema, 'apikeys');
