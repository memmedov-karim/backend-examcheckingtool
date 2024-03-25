const jwt = require("jsonwebtoken");
function auth(req, res, next) {
  const tokenU = req?.cookies?.user_token;
  console.log(tokenU)
  try {
    if (!tokenU) return res.status(401).json({success:false,message:'Unauthorized'})
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const veryfied = jwt.verify(tokenU, jwtSecretKey);
    req.user = veryfied;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
module.exports = { auth };
