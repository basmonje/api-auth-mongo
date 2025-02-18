import UserService from "./user.service.js";
const service = new UserService();

export async function create(req, res, next) {
  try {
    const result = await service.create(req.body);
    res.status(201).json({
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
    const result = await service.remove(req.params.id, req.body);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const result = await service.getById(req.params.id);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    const result = await service.getProfile(req.params.id);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRoles(req, res, next) {
  try {
    const result = await service.getRoles(req.params.id);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function assignRole(req, res, next) {
  try {
    const result = await service.assignRole(req.params.id, req.body);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function revokeRole(req, res, next) {
  try {
    const result = await service.revokeRole(req.params.id, req.body);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const result = await service.changePassword(req.params.id, req.body);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const result = await service.updateUserStatus(
      req.params.id,
      req.body.active
    );
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  create,
  getAll,
  remove,
  update,
  getById,
  getProfile,
  getRoles,
  assignRole,
  revokeRole,
  changePassword,
  updateUserStatus,
};
