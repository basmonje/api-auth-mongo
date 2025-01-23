import { Schema, model } from "mongoose";

const roleSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 50,
      required: true,
    },
    description: {
      type: String,
      maxlength: 250,
    },
    permissions: [
      {
        ref: "Permission",
        type: Schema.Types.ObjectId,
      },
    ],
    is_system: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

roleSchema.index({ name: 1 }, { unique: true });

export default model("Role", roleSchema);
