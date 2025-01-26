import SessionService from "./session.service.js";
const service = new SessionService();

export async function listSessions(req, res, next) {
  try {
    const result = await service.listActiveSessions(req.params.userId);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function revokeSession(req, res, next) {
  try {
    const result = await service.revokeSpecificSession(req.params.sessionId);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function revokeAllSessions(req, res, next) {
  try {
    const result = await service.revokeAllUserSessions(req.params.userId);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAll(req, res, next) {
  try {
    const result = await service.getAll();
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  listSessions,
  revokeSession,
  revokeAllSessions,
  getAll,
};
