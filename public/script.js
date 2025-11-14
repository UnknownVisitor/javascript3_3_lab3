// Com3_3.1: Pobieranie i wyświetlanie losowego GIF-a.
(function () {
    // URL do endpointu proxy
    const RANDOM_API_URL = "/random"; 
    
    // Elementy DOM
    const fetchRandomGifButton = document.getElementById('fetch-random-gif');
    const randomGifArea = document.getElementById('random-gif-area');
    
    // Funkcja realizująca zadanie Com3_3.1
    async function fetchRandomGif() {
        randomGifArea.innerHTML = '<p>Ładowanie losowego GIF-a...</p>';
        try {
            // Zapytanie do serwera proxy, który dodaje klucz API
            const response = await fetch(RANDOM_API_URL); 
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || response.statusText);
            }
            
            const data = await response.json();
            const gif = data.data; 
            
            // Pobieranie URL do obrazka
            const gifUrl = gif.images ? gif.images.original.url : null; 
            
            if (!gifUrl) {
                randomGifArea.innerHTML = '<p style="color: red;">Nie udało się znaleźć obrazka GIF.</p>';
                return;
            }

            // Wyświetlenie GIF-a
            randomGifArea.innerHTML = `
                <h2>Losowy GIF:</h2>
                <img src="${gifUrl}" alt="${gif.title || 'Losowy GIF'}">
            `;
            
        } catch (error) {
            console.error('Błąd pobierania losowego GIF-a:', error);
            randomGifArea.innerHTML = `<p style="color: red;">Błąd: ${error.message}</p>`;
        }
    }

    // Listener
    fetchRandomGifButton.addEventListener('click', fetchRandomGif);
})();
