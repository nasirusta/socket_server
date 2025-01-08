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

// Bağlı kullanıcıları tutmak için bir Map
const connectedUsers = new Map();

// Socket.IO bağlantıları
io.on("connection", (socket) => {
  console.log(`Kullanıcı bağlandı ID: ${socket.id}`);
  
  // Kullanıcı bilgilerini al
  const { userId, displayName } = socket.handshake.query;
  
  // Kullanıcıyı bağlı kullanıcılar listesine ekle
  connectedUsers.set(socket.id, {
    userId,
    displayName,
    socketId: socket.id
  });
  
  // Tüm kullanıcılara güncel kullanıcı listesini gönder
  io.emit("userJoined", Array.from(connectedUsers.values()));
  
  // Mesaj alma ve gönderme
  socket.on("message", (data) => {
    if (!data) {
      console.log("Hatalı mesaj formatı:", data);
      return;
    }
    
    const user = connectedUsers.get(socket.id);
    console.log(`Mesaj ${user.displayName} tarafından gönderildi: ${data}`);
    
    io.emit("messageReturn", {
      text: data,
      senderId: socket.id,
      senderName: user.displayName,
      timestamp: new Date().toISOString()
    });
  });

  socket.on("disconnect", () => {
    // Kullanıcıyı listeden çıkar
    connectedUsers.delete(socket.id);
    console.log(`Kullanıcı ayrıldı ID: ${socket.id}`);
    
    // Diğer kullanıcılara bildir
    io.emit("userLeft", socket.id);
    io.emit("userJoined", Array.from(connectedUsers.values()));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
