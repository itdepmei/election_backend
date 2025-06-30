const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { initModels } = require("./src/models");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

//routes
const authRoutes = require("./src/routes/auth.routes");
const governateroutes = require("./src/routes/Governate.routes");
const districtroutes = require("./src/routes/District.routes");
const subdistrictroutes = require("./src/routes/SubDistrict.routes");
const electionCenterroutes = require("./src/routes/ElectionCenter.routes");
const Stationroutes = require("./src/routes/Station.routes");
const Tapesroutes = require("./src/routes/Tapes.routes");
const Coordinatorroutes = require('./src/routes/Coordinator.route')
const Logroute = require('./src/routes/Log.route')
const district_managerRoute = require('./src/routes/DistrictManager.route')
const app = express();
// app.use(cors({
//   origin: [
//   "http://localhost:5173",
//   "http://192.168.100.52:5173"
// ],
//   credentials: true
// }));
app.use(cors());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      frameSrc: ["'self'", "js.stripe.com"],
      fontSrc: [
        "'self'",
        "fonts.googleapis.com",
        "fonts.gstatic.com",
        "res.cloudinary.com",
      ],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
})
);

// ));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/governate", governateroutes);
app.use("/api/district", districtroutes);
app.use("/api/subdistrict", subdistrictroutes);
app.use("/api/electioncenter", electionCenterroutes);
app.use("/api/station", Stationroutes);
app.use("/api/tapes", Tapesroutes);
app.use("/api/coordinator", Coordinatorroutes);
app.use("/api/log", Logroute);
app.use('/api/district-manager' , district_managerRoute)

app.use("/api/", authRoutes);

const PORT = process.env.PORT || 5000;
initModels().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server is running on http://localhost:5000");
  });
});
