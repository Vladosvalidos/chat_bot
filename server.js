import fetch from "node-fetch";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const PORT = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
    throw new Error("API-ключ OpenAI отсутствует. Проверьте файл .env.");
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Настройка CORS для разрешения запросов с других источников
app.use(cors());

// Middleware для обработки JSON
app.use(express.json());

// Роут для обработки запросов от клиента через HTTP
app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Поле 'message' отсутствует в запросе." });
    }

    try {
        // Запрос к OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: message }],
            }),
        });

        const data = await response.json();

        if (response.ok) {
            res.json({ reply: data.choices[0]?.message?.content || "Нет данных." });
        } else {
            res.status(500).json({ error: data.error || "Ошибка в ответе OpenAI." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message || "Ошибка при выполнении запроса." });
    }
});

// Реализация взаимодействия через WebSocket
io.on("connection", (socket) => {
    console.log("Новый клиент подключен");

    socket.on("chatMessage", async (message) => {
        if (!message) {
            socket.emit("error", { error: "Сообщение отсутствует." });
            return;
        }

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: message }],
                }),
            });

            const data = await response.json();

            if (response.ok) {
                socket.emit("chatReply", { reply: data.choices[0]?.message?.content || "Нет данных." });
            } else {
                socket.emit("error", { error: data.error || "Ошибка в ответе OpenAI." });
            }
        } catch (error) {
            socket.emit("error", { error: error.message || "Ошибка при выполнении запроса." });
        }
    });

    socket.on("disconnect", () => {
        console.log("Клиент отключен");
    });
});

// Запуск сервера
httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`HTTP доступен по адресу http://31.220.90.160:${PORT}`);
});
