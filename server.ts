import dotenv from "dotenv";

dotenv.config();

console.log("ENV TEST:", process.env.DATABASE_URL);
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
console.log("port===>>>", port)
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {

      const parsedUrl = parse(req.url || "/", true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (email) => {
      socket.join(email);
      console.log(`${email} joined room`);
    });
    socket.on("typing", ({ from, to }) => {
      socket.to(to).emit("typing", { from });
    });

    socket.on("stop-typing", ({ from, to }) => {
      socket.to(to).emit("stop-typing", { from });
    });

    // socket.on("send-message", (message) => {
    //   console.log("Got a new message!", message);
    //   const { receiver } = message;

    //   if (receiver) {

    //     io.to(receiver).emit("receive-message", message);
    //     console.log("new message!", message);
    //   }




    // Also broadcast to all except sender
    // socket.broadcast.emit("receive-message", message);
    // });

    socket.on("send-message", async (message) => {
      console.log("Received send-message:", message);
      console.log("Rooms before emit:", socket.rooms);

      try {
        const timestamp = message.timestamp || Date.now();
        const saved = await prisma.message.create({
          data: {
            id: message.id,
            sender: message.sender,
            receiver: message.receiver,
            text: message.text || null,
            image: message.image || null,
            createdAt: new Date(timestamp),
          },
        });
        const messageToEmit = {
          id: saved.id,
          sender: saved.sender,
          receiver: saved.receiver,
          text: saved.text ?? undefined,
          image: saved.image ?? undefined, // Convert null to undefined
          timestamp: saved.createdAt.getTime(),
        };

        io.to(message.receiver).emit("receive-message", messageToEmit);
        io.to(message.sender).emit("receive-message", messageToEmit);
        console.log("Emitted to both sender and receiver");
      } catch (err) {
        console.error("Message error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(" User disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(
        `> Ready on http://${hostname}:${port}`
      );
      console.log(`> Socket.IO server running`);
    });
});