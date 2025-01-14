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

// Настройка CORS для разрешения запросов с вашего GitHub Pages
app.use(cors({
    origin: "https://vladosvalidos.github.io",
    methods: ["GET", "POST"]
}));

// Middleware для обработки JSON
app.use(express.json());

// Роут для корневого URL
app.get("/", (req, res) => {
    res.send("Сервер работает! Используйте маршрут /api/chat для отправки запросов.");
});

// Роут для обработки запросов от клиента через HTTP
app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    console.log("Получено сообщение от клиента:", message);

    if (!message) {
        console.error("Ошибка: Поле 'message' отсутствует.");
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

        console.log("Ответ от OpenAI:", data);

        if (response.ok) {
            res.json({ reply: data.choices[0]?.message?.content || "Нет данных." });
        } else {
            console.error("Ошибка от OpenAI:", data.error);
            res.status(500).json({ error: data.error || "Ошибка в ответе OpenAI." });
        }
    } catch (error) {
        console.error("Ошибка при выполнении запроса:", error);
        res.status(500).json({ error: error.message || "Ошибка при выполнении запроса." });
    }
});

// Реализация взаимодействия через WebSocket
io.on("connection", (socket) => {
    console.log("Новый клиент подключен");

    socket.on("chatMessage", async (message) => {
        console.log("Получено сообщение через WebSocket:", message);

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

            console.log("Ответ от OpenAI через WebSocket:", data);

            if (response.ok) {
                socket.emit("chatReply", { reply: data.choices[0]?.message?.content || "Нет данных." });
            } else {
                console.error("Ошибка от OpenAI через WebSocket:", data.error);
                socket.emit("error", { error: data.error || "Ошибка в ответе OpenAI." });
            }
        } catch (error) {
            console.error("Ошибка при выполнении запроса через WebSocket:", error);
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
