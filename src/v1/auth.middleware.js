import SessionModel from "./sessions/session.model.js";

export const validateSession = async (req, res, next) => {
  const token = req.headers.authorization;

  const session = await SessionModel.findOne({
    access_token: token,
    status: "active",
    expires_at: { $gt: new Date() },
  });

  if (!session) {
    ErrorHandler.unauthorized("Sesión inválida o expirada");
  }

  await session.updateLastActivity();

  req.session = session;
  req.user = { id: session.user_id };
  
  next();
};
