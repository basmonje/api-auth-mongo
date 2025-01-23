import { Schema, model } from "mongoose";

const twoFactorSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    code: { type: String, required: true },
    expires_at: { type: Date, required: true },
  },
  { versionKey: false, timestamps: true }
);

twoFactorSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Eliminar automáticamente documentos expirados

export default model("TwoFactorAuth", twoFactorSchema);
