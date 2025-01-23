import PermissionService from "./permission.service.js";
const service = new PermissionService();

export async function create(req, res, next) {
  try {
    const result = await service.create(req.body);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const result = await service.update(req.params.id, req.body);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await service.remove(req.params.id);
    res.status(200).json({
      data: { ...result },
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
  create,
  update,
  remove,
  getAll,
};
