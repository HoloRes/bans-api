import mongoose from 'mongoose';

export interface IUser {
	_id: string;
	email: string;
    permissions: string[];
}

const UserDataSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	email: { type: String, required: true },
	permissions: { type: [String] },
});

export default mongoose.model<IUser>('User', UserDataSchema, 'users');
