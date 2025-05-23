document.addEventListener('DOMContentLoaded', async () => {
    // Initialize AOS
    AOS.init({ once: false, duration: 1000 });

    // Initialize Lucide icons
    lucide.createIcons();

    // DOM elements
    const chatForm = document.getElementById('chat-form');
    const newMessageInput = document.getElementById('new-message');
    const submitButton = document.getElementById('submit-button');
    const chatHistory = document.getElementById('chat-history');
    const messageCount = document.getElementById('message-count');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');

    let chatMessages = [];
    let wonokersoData = {};

    // Load data.json
    async function loadWonokersoData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('Failed to load data.json');
            wonokersoData = await response.json();
            console.log('Wonokerso data loaded:', wonokersoData);
        } catch (error) {
            console.error('Error loading data.json:', error);
            // Fallback data if loading fails
            wonokersoData = {
                "Information1": "desa wonokerso adalah desa di pakisaji",
                "Information2": "desa wonokerso adalah desa yang memiliki 3 sd dan 4 tk"
            };
        }
    }

    // Call this when page loads
    await loadWonokersoData();

    // Format timestamp
    function formatDate(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    }

    // Auto-resize textarea
    newMessageInput.addEventListener('input', () => {
        newMessageInput.style.height = 'auto';
        newMessageInput.style.height = `${newMessageInput.scrollHeight}px`;
    });

    // Render message
    function renderMessage(message, isBot, isTyping = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `px-4 pt-4 pb-2 rounded-xl ${isBot ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/5 border-white/10'} hover:bg-opacity-20 transition-all group hover:shadow-lg hover:-translate-y-0.5`;
        messageDiv.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="p-2 rounded-full ${isBot ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/10 text-white/60'} group-hover:bg-opacity-80 transition-colors">
                    <svg class="w-5 h-5" data-lucide="user-circle-2"></svg>
                </div>
                <div class="flex-grow min-w-0">
                    <div class="flex items-center justify-between gap-4 mb-2">
                        <h4 class="font-medium text-white">${isBot ? 'Wonokerso Bot' : 'You'}</h4>
                        <span class="text-xs text-gray-400 whitespace-nowrap">${formatDate(message.createdAt)}</span>
                    </div>
                    <p class="text-gray-300 text-sm break-words leading-relaxed relative bottom-2" ${isTyping ? 'id="typing-text"' : ''}>${message.content}</p>
                </div>
            </div>
        `;
        return messageDiv;
    }

    // Update chat history
    function updateChatHistory() {
        chatHistory.innerHTML = '';
        if (chatMessages.length === 0) {
            chatHistory.innerHTML = `
                <div class="text-center py-8" data-aos="fade-in">
                    <svg class="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-50" data-lucide="user-circle-2"></svg>
                    <p class="text-gray-400">No messages yet. Ask about Desa Wonokerso!</p>
                </div>
            `;
        } else {
            chatMessages.forEach((msg) => {
                chatHistory.appendChild(renderMessage(msg, msg.isBot));
            });
        }
        messageCount.textContent = `(${chatMessages.length})`;

        // Auto-scroll to bottom
        chatHistory.scrollTo({
            top: chatHistory.scrollHeight,
            behavior: 'smooth'
        });

        lucide.createIcons();
    }

    // Create context prompt from data.json
    function createContextPrompt(userMessage) {
        // Combine all information from data.json
        let context = "Informasi Desa Wonokerso:\n";
        for (const [key, value] of Object.entries(wonokersoData)) {
            context += `- ${value}\n`;
        }

        context += `\nPertanyaan: "${userMessage}"\n`;
        context += "Jawablah menggunakan informasi di atas jika relevan, jika tidak jawab secara umum dalam bahasa Indonesia.";

        return encodeURIComponent(context);
    }

    // Typing effect
    function typeMessage(message, messageDiv, callback) {
        const textElement = messageDiv.querySelector('#typing-text');
        let index = 0;
        textElement.textContent = '';

        function type() {
            if (index < message.length) {
                textElement.textContent += message[index];
                index++;
                // Auto-scroll during typing
                chatHistory.scrollTop = chatHistory.scrollHeight;
                setTimeout(type, 50);
            } else {
                callback();
            }
        }
        type();
    }

    // Show error
    function showError(msg) {
        errorMessage.textContent = msg;
        errorContainer.classList.remove('hidden');
    }

    // Hide error
    function hideError() {
        errorContainer.classList.add('hidden');
    }

    // Form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newMessage = newMessageInput.value.trim();

        if (!newMessage) return;

        hideError();
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <div class="relative flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" data-lucide="loader-2"></svg>
                <span>Processing...</span>
            </div>
        `;
        lucide.createIcons();

        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            content: newMessage,
            isBot: false,
            createdAt: Date.now(),
        };
        chatMessages.push(userMessage);
        updateChatHistory();

        try {
            // Create context prompt
            const contextPrompt = createContextPrompt(newMessage);

            // API call with context
            const response = await fetch(`https://api.ryzumi.vip/api/ai/chatgpt?text=${encodeURIComponent(newMessage)}&prompt=${contextPrompt}`);

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('API response:', data);

            // Handle response
            const botResponse = data.result || 'Maaf, tidak ada respons dari AI.';

            // Create bot message
            const botMessage = {
                id: (Date.now() + 1).toString(),
                content: '',
                isBot: true,
                createdAt: Date.now(),
            };
            const messageDiv = renderMessage(botMessage, true, true);
            chatHistory.appendChild(messageDiv);

            // Smooth scroll to bottom
            chatHistory.scrollTo({
                top: chatHistory.scrollHeight,
                behavior: 'smooth'
            });

            lucide.createIcons();

            // Type the response
            typeMessage(botResponse, messageDiv, () => {
                chatMessages.push({
                    id: botMessage.id,
                    content: botResponse,
                    isBot: true,
                    createdAt: botMessage.createdAt,
                });
                updateChatHistory();
            });
        } catch (error) {
            console.error('Error fetching response:', error);
            const errorMsg = error.message.includes('404') ? 'API endpoint not found. Please check the API configuration.' :
                error.message.includes('CORS') ? 'CORS error: API does not allow direct browser requests.' :
                    'Terjadi kesalahan saat menghubungi API.';
            showError(errorMsg);

            chatMessages.push({
                id: (Date.now() + 1).toString(),
                content: 'Maaf, terjadi kesalahan. Coba lagi.',
                isBot: true,
                createdAt: Date.now(),
            });
            updateChatHistory();
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = `
                <div class="relative flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" data-lucide="send"></svg>
                    <span>Send Message</span>
                </div>
            `;
            newMessageInput.value = '';
            newMessageInput.style.height = 'auto';
            lucide.createIcons();
        }
    });
});