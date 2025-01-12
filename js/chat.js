import fetch from "fetch";
import dotenv from "dotenv";

// Загрузка переменных окружения из .env
dotenv.config();

if (!process.env.OPENAI_API_KEY) {
    throw new Error("API-ключ OpenAI отсутствует. Проверьте файл .env.");
}

const fetchData = async () => {
    try {
        // Выполняем запрос к API OpenAI
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, // Ключ API из .env
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // Указываем модель OpenAI
                messages: [
                    { role: "user", content: "Привет! Как ты себя чувствуешь?" } // Сообщение от пользователя
                ]
            })
        });

        // Разбираем ответ
        const data = await response.json();

        // Проверяем успешность запроса
        if (response.ok) {
            console.log("Ответ от модели:", data.choices[0]?.message?.content || "Нет данных.");
        } else {
            console.error("Ошибка в ответе API:", data.error);
        }
    } catch (error) {
        console.error("Ошибка при выполнении запроса:", error);
    }
};

// Вызов функции
fetchData();
