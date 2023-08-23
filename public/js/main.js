const cardsContainer = document.getElementById('cards-container');

const backendUrlText = document.getElementById('backend-url');
const backendUrl = window.location.origin + "/sink";
backendUrlText.innerText = backendUrl;

const clearBtn = document.getElementById('clear-btn');
// confirm clear
clearBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear the messages?")) {
        fetch('/sink', {
            method: 'DELETE'
        });
    }
});

const timestampKey = "_timestamp"

const getMessages = async () => {
    const response = await fetch('/sink');
    const messages = await response.json();
    return messages;
};

const renderMessage = (message) => {
    const card = document.createElement('div');
    card.classList.add('card','bg-card', 'mb-4', 'shadow', 'rounded');
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    // wrap in pre
    const cardPre = document.createElement('pre');
    const cardText = document.createElement('code');
    cardText.classList.add('languague-json', 'hljs');

    // json highlight
    const code = hljs.highlight(JSON.stringify(message.message, null, 2) , { language: 'json' });

    cardText.innerHTML = code.value;
    cardPre.appendChild(cardText);
    cardBody.appendChild(cardPre);

    const cardFooter = document.createElement('div');
    cardFooter.classList.add('card-footer', 'text-success');
    const cardFooterText = document.createTextNode(new Date(message[timestampKey]).toLocaleString().split(' ')[1] + " [" + message["_type"] + "]");
    cardFooter.appendChild(cardFooterText);
    card.appendChild(cardBody);
    card.appendChild(cardFooter);
    cardsContainer.appendChild(card);
};

const messageQueueCache = [];

const renderMessageHandler = (messages) => {
    messages.sort((a, b) => {
        // latest first
        return b[timestampKey] - a[timestampKey];
    });
    
    if (messageQueueCache.length === messages.length) {
        return;
    }
    
    messageQueueCache.length = 0;
    messageQueueCache.push(...messages);
    cardsContainer.innerHTML = '';
    messages.forEach(renderMessage);
}

setInterval(() => {
    getMessages().then(renderMessageHandler);
}, 1000);

