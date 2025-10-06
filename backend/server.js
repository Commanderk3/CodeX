const express = require("express");
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");

const { Server } = require("socket.io");
dotenv.config();
// routes
const authRoutes = require('./src/routes/auth');
const matchMaking = require("./src/sockets/matchMaking");
const submitCode = require("./src/sockets/submitCode");
const userRoutes = require("./src/routes/user");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);

app.use("/api/user", userRoutes);

// Routes
app.get("/", (req, res) => {
    res.send("Hello player!");
})

io.use((socket, next) => {
  const token = socket.handshake.auth.token; // client sends this in auth
  console.log(token);
  if (!token) {
    console.log("❌ No token received");
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // attach decoded user data
    console.log("✅ Authenticated user:", decoded.id);
    next();
  } catch (err) {
    console.log("❌ Invalid token:", err.message);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("New client connected ", socket.id);

  matchMaking.matchMaking(socket, io);
  submitCode.submitCode(socket, io);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
})

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
