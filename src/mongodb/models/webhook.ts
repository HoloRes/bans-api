import { generate as generatePassword } from 'generate-password';
import mongoose from 'mongoose';
import mongooseHidden from 'mongoose-hidden';

export interface IWebhook {
	url: string;
    owner: string;
    secret: string;
    disabled: boolean;
    subscriptions: string[];
    failures: number;
}

const WebhookSchema = new mongoose.Schema({
	url: { type: String, required: true },
	owner: { type: String, required: true, hidden: true },
	secret: { type: String, default: generatePassword({ length: 32, numbers: true }) },
	disabled: { type: Boolean, default: false },
	subscriptions: [String],
	failures: { type: Number, default: 0, hidden: true },
});
WebhookSchema.plugin(mongooseHidden());

export default mongoose.model<IWebhook>('Webhook', WebhookSchema, 'webhooks');
