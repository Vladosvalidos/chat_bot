document.addEventListener("DOMContentLoaded", () => {
    const chatBody = document.getElementById("chatBody");
    const userInput = document.getElementById("userInput");
    const sendButton = document.querySelector(".chat-footer button");

    if (!chatBody || !userInput || !sendButton) {
        console.error("Один или несколько элементов чата не найдены.");
        return;
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage("user", message);
        userInput.value = "";

        try {
            const response = await fetch("http://localhost:3000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });

            const data = await response.json();

            if (response.ok) {
                addMessage("bot", data.reply || "Нет ответа от бота.");
            } else {
                console.error("Ошибка API:", data.error);
                addMessage("bot", "Произошла ошибка при обработке вашего сообщения.");
            }
        } catch (error) {
            console.error("Ошибка при подключении к серверу:", error.message);
            addMessage("bot", "Ошибка подключения к серверу.");
        }
    }

    function addMessage(sender, text) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    sendButton.addEventListener("click", sendMessage);

    userInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
});
