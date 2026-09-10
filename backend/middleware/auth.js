import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.json({
      success: false,
      message: "Not authorised. Login again",
    });
  }

  try {
       console.log("JWT SECRET EXISTS:", !!process.env.JWT_SECRET);
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = token_decode.id;
    if (!req.body) req.body = {};
    req.body.userId = token_decode.id;

    next();
  } catch (error) {
    console.log(error.message);

    res.json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default authMiddleware;
