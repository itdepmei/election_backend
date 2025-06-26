const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.authenticate = async (req, res, next) => {  
  let token;

  // Check Authorization header for Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

    if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }


  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Authorization middleware: checks for required role
exports.authorize = (role) => (req, res, next) => {
  console.log("rolebbbbbbbbb" , req.user.role)
  if (!req.user || req.user.role !== role) {
    console.log("not authorized")
    return res.status(403).json({ message: "Forbidden: insufficient privileges" });
  }
  next();
};
