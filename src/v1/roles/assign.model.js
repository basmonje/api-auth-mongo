import { Schema, model } from "mongoose";

const assignmentRoleSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: Schema.Types.ObjectId, ref: "Role", required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default model("AssignmentRole", assignmentRoleSchema);
