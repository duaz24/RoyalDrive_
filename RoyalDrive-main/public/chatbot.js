// public/chatbot.js
document.addEventListener("DOMContentLoaded", () => {
    // 1. Injetar o HTML do Chat
    const chatHTML = `
        <div class="chat-widget">
            <button class="chat-toggle" onclick="toggleChat()">💬</button>
            <div class="chat-box" id="chatBox">
                <div class="chat-header">
                    <span>Assistente Royal</span>
                    <span style="cursor:pointer" onclick="toggleChat()">✖</span>
                </div>
                <div class="chat-messages" id="chatMessages">
                    <div class="msg bot-msg">Olá! Sou o assistente virtual. Pergunta-me sobre a frota ou agências!</div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chatInput" placeholder="Escreve aqui..." onkeypress="handleEnter(event)">
                    <button onclick="sendMessage()">➤</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // 2. Injetar o CSS dinamicamente (opcional, se não quiseres adicionar o <link> em todos os HTMLs)
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'chatbot.css';
    document.head.appendChild(link);
});

function toggleChat() {
    const box = document.getElementById('chatBox');
    box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
}

function handleEnter(e) {
    if (e.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const msgArea = document.getElementById('chatMessages');
    const text = input.value.trim();

    if (!text) return;

    // Adiciona mensagem do utilizador
    msgArea.innerHTML += `<div class="msg user-msg">${text}</div>`;
    input.value = '';
    msgArea.scrollTop = msgArea.scrollHeight;

    // Mostra indicador de "a escrever..."
    const loadingId = 'loading-' + Date.now();
    msgArea.innerHTML += `<div class="msg bot-msg" id="${loadingId}">...</div>`;

    try {
        const res = await fetch('/api/chatbot/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();

        // Remove indicador e mete resposta real
        document.getElementById(loadingId).remove();
        msgArea.innerHTML += `<div class="msg bot-msg">${data.response}</div>`;
        
    } catch (err) {
        document.getElementById(loadingId).remove();
        msgArea.innerHTML += `<div class="msg bot-msg" style="color:red">Erro de ligação.</div>`;
    }
    
    msgArea.scrollTop = msgArea.scrollHeight;
}
