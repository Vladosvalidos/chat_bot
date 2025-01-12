import fetch from "node-fetch";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

const PORT = 3000;

if (!process.env.OPENAI_API_KEY) {
    throw new Error("API-ключ OpenAI отсутствует. Проверьте файл .env.");
}

const app = express();

// Настройка CORS для разрешения запросов с других источников
app.use(cors());

// Middleware для обработки JSON
app.use(express.json());

// Роут для обработки запросов от клиента
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

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
