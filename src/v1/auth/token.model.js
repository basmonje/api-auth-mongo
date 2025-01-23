import { Schema, model } from "mongoose";

const tokenSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    type: { type: String, enum: ["access", "refresh", "blacklist"], required: true },
    expires_at: { type: Date, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Token", tokenSchema);
