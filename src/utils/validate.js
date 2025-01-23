import { ErrorHandler } from "./error.js";

export function validateSchema(schema) {
  return (req, _res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      ErrorHandler.badRequest(error.details[0].message);
    } else {
      next();
    }
  };
}
