const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { initModels } = require("./src/models");

// Routes
const authRoutes = require("./src/routes/auth.routes");
const governateroutes = require("./src/routes/Governate.routes");
const districtroutes = require("./src/routes/District.routes");
const subdistrictroutes = require("./src/routes/SubDistrict.routes");
const electionCenterroutes = require("./src/routes/ElectionCenter.routes");
const Stationroutes = require("./src/routes/Station.routes");
const Tapesroutes = require("./src/routes/Tapes.routes");
const Coordinatorroutes = require("./src/routes/Coordinator.route");
const Logroute = require("./src/routes/Log.route");
const district_managerRoute = require("./src/routes/DistrictManager.route");
const campaignRoute = require("./src/routes/Campaign.routes");
const FinanceCapitalRoute = require("./src/routes/FinanceCapital.routes");
const ExpenseRoute = require("./src/routes/Expense.routes");
const NotificationRoute = require("./src/routes/Notification.route");
const BudgetRoute = require("./src/routes/Budget.routes");
const LocationRoute = require("./src/routes/Location.routes");

const app = express();

const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  allowEIO3: true,
});

const clients = new Map();
const androidClients = new Map();

app.set("io", io);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

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
app.use("/api/district-manager", district_managerRoute);
app.use("/api/campaign", campaignRoute);
app.use("/api/finance-capital", FinanceCapitalRoute);
app.use("/api/expense", ExpenseRoute);
app.use("/api/notifications", NotificationRoute);
app.use("/api/budget", BudgetRoute);
app.use("/api/location", LocationRoute);
app.use("/api/", authRoutes);

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("register", (data) => {
    const { userId, token, deviceType } = data || {};
    try {
      if (token) {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key"
        );
        clients.set(socket.id, {
          userId: decoded.id || userId,
          campaign_id: decoded.campaign_id || null,
          socketId: socket.id,
          lastSeen: new Date(),
          deviceType: deviceType || "web",
        });
      } else {
        clients.set(socket.id, {
          userId: userId || `guest_${socket.id}`,
          campaign_id: null,
          socketId: socket.id,
          lastSeen: new Date(),
          deviceType: deviceType || "web",
        });
      }

      if (deviceType === "android") {
        androidClients.set(socket.id, clients.get(socket.id));
      }

      socket.emit("registration_success", {
        message: "Successfully registered",
        userId: clients.get(socket.id).userId,
        socketId: socket.id,
      });
    } catch (error) {
      socket.emit("registration_error", {
        message: "Registration failed: " + error.message,
      });
    }
  });

  socket.on("location_update", (data) => {
    // const clientInfo = clients.get(socket.id);
    // console.log("📍 Location update received:", data, "Client Info:", clientInfo);
    // if (!data || !clientInfo) {
    //   return socket.emit("location_error", { message: "Client not registered or invalid data" });
    // }

    const { latitude, longitude, timestamp, userId, token } = data;
    let decoded = {};

    if (token) {
      try {
         decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key"
        );
        console.log("🔑 Token verified for user:", decoded);
      } catch (error) {
        return socket.emit("location_error", {
          message: "Invalid token: " + error.message,
        });
      }
    }

    if (!latitude || !longitude) {
      console.error("❌ Invalid location data:", data);
      return socket.emit("location_error", {
        message: "Invalid location data",
      });
    }

    socket.emit("location_update_success", {
      message: "Location updated successfully",
      timestamp: new Date().toISOString(),
    });

    console.log("📍 Location update received:");

    const locationData = {
      user_id: userId,
      location: [parseFloat(longitude), parseFloat(latitude)],
      campaign_id: decoded.campaign_id || null,
      phone_number: decoded.phone_number || "",
      first_name: decoded.first_name || "",
      second_name: decoded.second_name || "",
      last_name: decoded.last_name || "",
      election_center_id: decoded.election_center_id || null,
      timestamp: timestamp || new Date().toISOString(),
      socketId: socket.id,
      ...data,
    };
   for (const [clientSocketId, clientInfo] of clients.entries()) {
  if (clientInfo.campaign_id === decoded.campaign_id) {
    io.to(clientSocketId).emit("new-location", locationData);
  }
}
  });

  socket.on("request_locations", (data) => {
    const { userId } = data;
    const locations = [
      {
        user_id: userId || "demo_user",
        location: [31.7683, 35.2137],
        timestamp: new Date().toISOString(),
        deviceType: "android",
      },
    ];
    socket.emit("locations_response", {
      locations,
      count: locations.length,
      requestedUserId: userId,
    });
  });

  socket.on("get_connected_users", () => {
    const connectedUsers = Array.from(clients.values()).map((client) => ({
      userId: client.userId,
      deviceType: client.deviceType,
      lastSeen: client.lastSeen,
    }));
    socket.emit("connected_users", {
      users: connectedUsers,
      count: connectedUsers.length,
      androidClients: androidClients.size,
    });
  });

  socket.on("ping", () => {
    const clientInfo = clients.get(socket.id);
    if (clientInfo) {
      clientInfo.lastSeen = new Date();
    }
    socket.emit("pong", { timestamp: new Date().toISOString() });
  });

  socket.on("disconnect", (reason) => {
    const clientInfo = clients.get(socket.id);
    if (clientInfo) {
      socket.broadcast.emit("user_disconnected", {
        userId: clientInfo.userId,
        socketId: socket.id,
        deviceType: clientInfo.deviceType,
        reason,
      });
    }
    clients.delete(socket.id);
    androidClients.delete(socket.id);
    console.log("🔴 Client disconnected:", socket.id);
  });

  socket.on("error", (error) => {
    console.error("❌ Socket error:", error);
  });
});

setInterval(() => {
  const now = new Date();
  clients.forEach((client, socketId) => {
    if (now - client.lastSeen > 5 * 60 * 1000) {
      clients.delete(socketId);
      androidClients.delete(socketId);
    }
  });
}, 60000);

setInterval(() => {
  io.emit("server_stats", {
    connectedClients: clients.size,
    androidClients: androidClients.size,
    timestamp: new Date().toISOString(),
  });
}, 30000);

const PORT = process.env.PORT || 5000;
initModels().then(() => {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server + Socket.IO running on http://localhost:${PORT}`);
  });
});

module.exports = { io, app, server };
