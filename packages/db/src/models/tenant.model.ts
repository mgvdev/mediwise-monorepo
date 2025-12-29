import mongoose from "mongoose";

const { Schema, model } = mongoose;

const tenantSchema = new Schema(
	{
		_id: { type: String },
		name: { type: String, required: true, unique: true },
		logoUrl: { type: String },
		status: { type: String },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
	},
	{ collection: "tenants" },
);

const Tenant = model("Tenant", tenantSchema);

export { Tenant };
