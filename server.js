const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require('http');
const { initModels } = require("./src/models");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();
const { Server } = require('socket.io');

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
const campaignRoute = require('./src/routes/Campaign.routes')
const FinanceCapitalRoute = require('./src/routes/FinanceCapital.routes')
const ExpenseRoute = require('./src/routes/Expense.routes')
const NotificationRoute = require('./src/routes/Notification.route')
const BudgetRoute = require('./src/routes/Budget.routes')
const LocationRoute = require('./src/routes/Location.routes')

//
const app = express();
// app.use(cors({
//   origin: [
//   "http://localhost:5173",
//   "http://192.168.100.52:5173"
// ],
//   credentials: true
// }));


const server = http.createServer(app);

// 👇 WebSocket server

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"]  },
});

app.set("io", io);



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
app.use('/api/campaign' , campaignRoute)
app.use('/api/finance-capital' , FinanceCapitalRoute)
app.use('/api/expense' , ExpenseRoute)
app.use('/api/notifications' , NotificationRoute)
app.use('/api/budget' ,  BudgetRoute)
app.use('/api/location', LocationRoute);
app.use("/api/", authRoutes);



io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Client tells server their role and userId for room joining
  socket.on("join", ({ role, userId }) => {
    if (role) {
      socket.join(role); // join role room
      socket.join(`user_${userId}`); // join user-specific room
      
      console.log(`👥 User ${userId} joined role room: ${role}`);
    }
  });

  // Client requests all notifications
  socket.on("notifications:fetchAll", async () => {
    try {
      const Notification = require("./models/Notification.model");
      const notifications = await Notification.findAll({
        order: [["createdAt", "DESC"]],
      });

      socket.emit("notifications:all", notifications);
    } catch (err) {
      socket.emit("notifications:error", {
        message: "فشل في جلب الإشعارات",
        error: err.message,
      });
    }
  });
  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});  




const PORT = process.env.PORT || 5000;
initModels().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server is running on http://localhost:5000");
  });
});
