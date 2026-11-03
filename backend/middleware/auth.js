import jwt from "jsonwebtoken";

class AuthMiddleware {
  getSecret() {
    return process.env.JWT_SECRET;
  }

  /**
   * Middleware to authenticate JWT token from request headers
   */
  handle = (req, res, next) => {
    const { token } = req.headers;

    if (!token) {
      return res.json({
        success: false,
        message: "Not authorised. Login again",
      });
    }

    try {
      console.log("JWT SECRET EXISTS:", !!this.getSecret());
      const token_decode = jwt.verify(token, this.getSecret());

      req.userId = token_decode.id;
      if (!req.body) req.body = {};
      req.body.userId = token_decode.id;

      next();
    } catch (error) {
      console.log(error.message);

      return res.json({
        success: false,
        message: "Invalid token",
      });
    }
  };
}

const authMiddlewareInstance = new AuthMiddleware();
const authMiddleware = authMiddlewareInstance.handle;

export default authMiddleware;
export { AuthMiddleware };
