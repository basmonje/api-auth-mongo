import { ErrorHandler } from "../../utils/error.js";
import SessionModel from "./session.model.js";

export default class SessionService {
  async create({
    user_id,
    access_token,
    refresh_token,
    ip_address,
    user_agent,
    device_info,
    status = "active",
  }) {
    const session = new SessionModel({
      user_id: user_id,
      access_token: access_token,
      refresh_token: refresh_token,
      ip_address: ip_address,
      user_agent: user_agent,
      device_info: device_info,
      status: status,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    });
    await session.save();
    return session;
  }

  async revoke({ access_token }) {
    const session = await SessionModel.findOne({
      access_token: access_token,
      status: "active",
    });

    if (!session) {
      ErrorHandler.notFound("Sesión no encontrada");
    }

    await session.revoke("user_logout");

    return {
      message: "Session cerrada",
    };
  }

  async find({ user_id, refresh_token, status }) {
    return await SessionModel.findOne({
      user_id: user_id,
      refresh_token: refresh_token,
      status: status,
    });
  }

  async updateSession({ session_id, accessToken }) {
    return await SessionModel.findByIdAndUpdate(
      session_id,
      {
        access_token: accessToken,
        last_activity: new Date(),
      },
      {
        new: true,
      }
    );
  }

  async listActiveSessions(userId) {
    return await SessionModel.find({
      user_id: userId,
      status: "active",
      expires_at: { $gt: new Date() },
    }).select("-access_token -refresh_token");
  }

  async revokeSpecificSession(sessionId, reason = "admin_action") {
    const session = await SessionModel.findById(sessionId);

    if (!session) {
      ErrorHandler.notFound("Sesión no encontrada");
    }

    await session.revoke(reason);

    return {
      message: "Sesión revocada exitosamente",
    };
  }

  async revokeAllUserSessions(userId) {
    const result = await SessionModel.revokeUserSessions(userId);

    return {
      message: `Se revocaron ${result.modifiedCount} sesiones`,
      totalRevoked: result.modifiedCount,
    };
  }

  async getAll() {
    return await SessionModel.find();
  }
}
