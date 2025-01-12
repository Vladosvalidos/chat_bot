const fetchData = async (message) => {
    try {
        // Отправка запроса на ваш сервер (например, Node.js сервер)
        const response = await fetch("http://localhost:3000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }), // Передача сообщения от пользователя
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Ответ от ИИ:", data.reply || "Нет ответа от сервера.");
            return data.reply || "Нет ответа.";
        } else {
            console.error("Ошибка сервера:", data.error);
            return "Ошибка обработки вашего сообщения.";
        }
    } catch (error) {
        console.error("Ошибка подключения к серверу:", error);
        return "Ошибка подключения к серверу.";
    }
};

// Пример вызова функции
fetchData("Привет, как дела?")
    .then((reply) => {
        console.log("Ответ от ИИ:", reply);
    })
    .catch((error) => {
        console.error("Ошибка:", error);
    });
