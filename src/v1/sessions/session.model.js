import { Schema, model } from "mongoose";

const sessionSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    access_token: {
      type: String,
      required: true,
    },
    refresh_token: {
      type: String,
    },
    ip_address: {
      type: String,
    },
    user_agent: {
      type: String,
      required: true,
    },
    device_info: {
      type: {
        type: String,
        enum: ["mobile", "tablet", "desktop", "other"],
        default: "other",
      },
      browser: String,
      os: String,
    },
    status: {
      type: String,
      enum: ["active", "expired", "revoked"],
      default: "active",
    },
    last_activity: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    revoked_at: {
      type: Date,
    },
    revocation_reason: {
      type: String,
      enum: [
        "user_logout",
        "session_expired",
        "security_concern",
        "admin_action",
      ],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices para mejorar el rendimiento de las consultas comunes
sessionSchema.index({ user_id: 1, status: 1 });
sessionSchema.index({ access_token: 1 });
sessionSchema.index({ refresh_token: 1 });
sessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index para auto-eliminar sesiones expiradas

// Índice compuesto para búsquedas por usuario y fecha
sessionSchema.index({ user_id: 1, last_activity: -1 });

// Método para actualizar la última actividad
sessionSchema.methods.updateLastActivity = function () {
  this.last_activity = new Date();
  return this.save();
};

// Método para revocar la sesión
sessionSchema.methods.revoke = function (reason = "user_logout") {
  this.status = "revoked";
  this.revoked_at = new Date();
  this.revocation_reason = reason;
  return this.save();
};

// Método estático para limpiar sesiones antiguas
sessionSchema.statics.cleanupOldSessions = async function () {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    $or: [
      { status: "expired" },
      { status: "revoked", revoked_at: { $lt: thirtyDaysAgo } },
    ],
  });
};

// Método estático para encontrar sesiones activas de un usuario
sessionSchema.statics.findActiveSessions = function (userId) {
  return this.find({
    user_id: userId,
    status: "active",
    expires_at: { $gt: new Date() },
  }).sort({ last_activity: -1 });
};

// Middleware pre-save para actualizar el estado si ha expirado
sessionSchema.pre("save", function (next) {
  if (this.expires_at < new Date()) {
    this.status = "expired";
  }
  next();
});

export default model("Session", sessionSchema);
