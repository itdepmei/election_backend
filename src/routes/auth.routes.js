const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  updateMe,
  changePassword,
  getMe,
} = require("../controllers/auth.controller");
const {
  adminAddUser,
  adminUpdateUser,
  adminDeleteUser,
  getAllUsers,
  toggleActive,
  setAdminRole,
  getUserById,
  getAllUsersByRole,
  changeUserRole,
  confirmVoting,
  deleteAllUsers,
  getAllConfirmedVoters,
  HasVoted,
} = require("../controllers/admin.auth.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const upload = require("../config/multer");


router.post(
  "/register",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "identity_image", maxCount: 1 },
    { name: "voting_card_image", maxCount: 1 },
  ]),
  register
);
router.post("/login", login);


router.use(authenticate);

router.put("/change-password", changePassword);
router.post("/logout", logout);
router.get("/user", getMe);
router.put(
  "/user/:id",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "identity_image", maxCount: 1 },
    { name: "voting_card_image", maxCount: 1 },
  ]),
  updateMe
);
router.put("/has-voted", HasVoted);


router.use(authorize(["system_admin" , "owner" , 'observer' , 'coordinator' , 'district_manager' ]));

router.post(
  "/users",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "identity_image", maxCount: 1 },
    { name: "voting_card_image", maxCount: 1 },
  ]),
  adminAddUser
);


router.get("/users/confirm-voting", getAllConfirmedVoters);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.get("/users-role/:role", getAllUsersByRole);
router.put("/users/:id",
   upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "identity_image", maxCount: 1 },
    { name: "voting_card_image", maxCount: 1 },
  ]),
  
  adminUpdateUser);
router.delete("/users/:id", adminDeleteUser);
router.delete('/users' , deleteAllUsers)
router.put("/toggle-active/:id", toggleActive);
router.put("/confirm-voting/:id", confirmVoting);
router.put("/set-admin/:id", setAdminRole);
router.put("/change-role/:id", changeUserRole);

module.exports = router;
