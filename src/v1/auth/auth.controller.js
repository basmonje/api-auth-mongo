import AuthService from "./auth.service.js";

const service = new AuthService();

function detectDeviceType(req) {
  const userAgent = req.headers["user-agent"] || "";

  if (/mobile/i.test(userAgent)) {
    return "mobile";
  } else if (/tablet/i.test(userAgent)) {
    return "tablet";
  } else {
    return "desktop";
  }
}

function detectBrowser(req) {
  const userAgent = req.headers["user-agent"] || "";

  if (/chrome|crios/i.test(userAgent) && !/edge|edg/i.test(userAgent)) {
    return "Chrome";
  } else if (/firefox|fxios/i.test(userAgent)) {
    return "Firefox";
  } else if (
    /safari/i.test(userAgent) &&
    !/chrome|crios|edge|edg/i.test(userAgent)
  ) {
    return "Safari";
  } else if (/edge|edg/i.test(userAgent)) {
    return "Edge";
  } else if (/opera|opr/i.test(userAgent)) {
    return "Opera";
  } else if (/msie|trident/i.test(userAgent)) {
    return "Internet Explorer";
  } else {
    return "Unknown";
  }
}

function detectOS(req) {
  const userAgent = req.headers["user-agent"] || "";

  if (/windows nt 10.0/i.test(userAgent)) {
    return "Windows 10";
  } else if (/windows nt 6.3/i.test(userAgent)) {
    return "Windows 8.1";
  } else if (/windows nt 6.2/i.test(userAgent)) {
    return "Windows 8";
  } else if (/windows nt 6.1/i.test(userAgent)) {
    return "Windows 7";
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    return "MacOS";
  } else if (/linux/i.test(userAgent)) {
    return "Linux";
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    return "iOS";
  } else if (/android/i.test(userAgent)) {
    return "Android";
  } else if (/windows phone/i.test(userAgent)) {
    return "Windows Phone";
  } else {
    return "Unknown";
  }
}

export async function signIn(req, res, next) {
  try {
    const requestInfo = {
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      deviceType: detectDeviceType(req),
      browser: detectBrowser(req),
      os: detectOS(req),
    };
    const result = await service.login(req.body, requestInfo);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function signUp(req, res, next) {
  try {
    const result = await service.register(req.body);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const { refresh_token } = req.body;
    const result = await service.refreshToken(refresh_token);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const result = await service.logout(req.params.token);
    res.status(200).json({
      message:
        "Si el correo existe, recibirás instrucciones para restablecer tu contraseña",
      data: { token: result },
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const result = await service.forgotPassword(req.body);
    res.status(200).json({
      message:
        "Si el correo existe, recibirás instrucciones para restablecer tu contraseña",
      data: { token: result },
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    await service.restartPassword(req.params.token, req.body);
    res.status(200).json({
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    next(error);
  }
}

export default {
  signIn,
  signUp,
  resetPassword,
  forgotPassword,
  refreshToken,
  logout,
};
