import { Schema, model } from "mongoose";

const permissionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 250,
    },
    resource: {
      type: String,
      required: true,
      trim: true,
      enum: ["users", "roles", "permissions", "assignments", "profile", "auth"],
    },
    action: {
      type: String,
      required: true,
      enum: ["create", "read", "update", "delete", "manage"],
      trim: true,
    },
    attributes: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

permissionSchema.index({ name: 1 }, { unique: true });
permissionSchema.index({ resource: 1, action: 1 });

export default model("Permission", permissionSchema);
