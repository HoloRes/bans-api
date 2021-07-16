import mongoose from 'mongoose';

export interface IClientData {
	_id: string;
	mqMisses: number;
}

const ClientDataSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	mqMisses: { type: Number, default: 0 },
});

export default mongoose.model<IClientData>('ClientData', ClientDataSchema, 'clientdata');
