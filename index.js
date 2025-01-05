import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "*", // Gerektiği şekilde yapılandırın
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
}));

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// HTTP server oluşturma
const server = createServer(app);

// Socket.IO server oluşturma
const io = new Server(server, {
  cors: {
    origin: "*", // Gerektiği şekilde yapılandırın
  },
  transports: ["websocket", "polling"], // Her iki transport türünü ekleyin
});

// Socket.IO bağlantıları
io.on("connection", (socket) => {
  console.log(`Kullanıcı bağlandı ID: ${socket.id}`);

  socket.on("room", (data) => {
    console.log(`Odaya katılım: ${data}`);
    socket.join(data);
  });

  socket.on("message", (data) => {
    console.log(`Mesaj ${socket.id} tarafından oda ${data.room}'a: ${data.message}`);
    io.to(data.room).emit("messageReturn", data.message);
  });

  socket.on("disconnect", () => {
    console.log(`Kullanıcı ayrıldı ID: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
