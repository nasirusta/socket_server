import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "*", // Gerektiği şekilde yapılandırma
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
    origin: "*", // Gerektiği şekilde yapılandırma
  },
  transports: ["websocket", "polling"], // Her iki transport türü
});

// Socket.IO bağlantıları
io.on("connection", (socket) => {
  console.log(`Kullanıcı bağlandı ID: ${socket.id}`);

  // Mesaj alma ve gönderme
  socket.on("message", (data) => {
    if (!data.message) {
      console.log("Hatalı mesaj formatı:", data);
      return;
    }
    
    console.log(`Mesaj ${socket.id} tarafından gönderildi: ${data.message}`);
    // Tüm bağlı kullanıcılara mesajı gönder
    io.emit("messageReturn", {
      message: data.message,
      senderId: socket.id
    });
  });

  socket.on("disconnect", () => {
    console.log(`Kullanıcı ayrıldı ID: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
