import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma";

dotenv.config();

const port = parseInt(process.env.PORT || "3001", 10);

const httpServer = createServer((req, res) => {
    // Simple health check endpoint for the deployment platform
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Socket Server is running");
});

const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow connections from Vercel frontend
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

    socket.on("send-message", async (message) => {
        console.log("Received send-message:", message);

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
                image: saved.image ?? undefined,
                timestamp: saved.createdAt.getTime(),
            };

            io.to(message.receiver).emit("receive-message", messageToEmit);
            console.log("Emitted to receiver");
        } catch (err) {
            console.error("Message error:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

httpServer.listen(port, () => {
    console.log(`> Socket Server running on port ${port}`);
});
