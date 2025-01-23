import boom from "@hapi/boom";
import winston from "winston";

const logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    ...(process.env.NODE_ENV === "development"
      ? [new winston.transports.Console()]
      : []),
  ],
});

export class ErrorHandler {
  static unauthorized(message = "No autorizado") {
    throw boom.unauthorized(message);
  }

  static forbidden(message = "Acceso denegado") {
    throw boom.forbidden(message);
  }

  static notFound(message = "Recurso no encontrado") {
    throw boom.notFound(message);
  }

  static badRequest(message = "Datos inválidos") {
    throw boom.badRequest(message);
  }

  static conflict(message = "Conflicto con recurso existente") {
    throw boom.conflict(message);
  }
}

export function errorMiddleware(err, req, res, next) {
  // console.error(err);

  // Si es un error de Boom
  if (err.isBoom) {
    const { output } = err;
    return res.status(output.statusCode).json({
      status: "error",
      type: output.payload.error,
      message: output.payload.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Manejar errores específicos de MongoDB
  if (err.name === "MongoServerError" && err.code === 11000) {
    return res.status(409).json({
      status: "error",
      type: "DUPLICATE_KEY",
      message: "Ya existe un registro con estos datos",
    });
  }

  // Manejar errores de validación de Mongoose
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      status: "error",
      type: "VALIDATION_ERROR",
      message: errors.join(", "),
    });
  }

  // Manejar errores de JWT
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      type: "TOKEN_EXPIRED",
      message: "El token ha expirado",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      type: "INVALID_TOKEN",
      message: "Token inválido",
    });
  }

  // Error por defecto (500)
  return res.status(500).json({
    status: "error",
    type: "INTERNAL_SERVER_ERROR",
    message: "Ha ocurrido un error interno",
    ...(process.env.NODE_ENV === "development" && {
      detail: err.message,
      stack: err.stack,
    }),
  });
}

export function logErrors(err, req, res, next) {
  logger.error({
    message: err.message,
    error: err.name,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  });

  next(err);
}
