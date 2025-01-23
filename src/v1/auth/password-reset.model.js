import { Schema, model } from "mongoose";

const passwordResetSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    expires_at: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índice para búsqueda rápida de tokens y limpieza
passwordResetSchema.index({ token: 1 });
// Índice TTL para auto-eliminar documentos expirados
passwordResetSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default model("PasswordReset", passwordResetSchema);
