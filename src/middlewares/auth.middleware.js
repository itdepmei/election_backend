const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.authenticate = async (req, res, next) => {  
  let token;
  console.log("auth")

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
    console.log("user auth")
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
exports.authorize = (roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase().trim();

    console.log("🟨 Required Roles:", roles);
    console.log("🟦 User Role:", userRole);

    if (!userRole || !roles.includes(userRole)) {
      console.log("❌ Access Denied");
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log("✅ Access Granted");
    next();
  };
};

exports.authorizeExcept = (excludedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase().trim();
    console.log("ggggggg" , userRole)

    if (!userRole) {
      return res.status(401).json({ message: "Unauthorized: missing role" });
    }

    if (excludedRoles.includes(userRole)) {
      return res.status(403).json({ message: `Access denied for role: ${userRole}` });
    }

    next();
  };
};
