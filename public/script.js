(function () {
    // --- URLs (Względne adresy do proxy) ---
    const RANDOM_API_URL = "/random"; 
    const SEARCH_API_URL = "/search"; 

    // --- Elementy DOM ---
    const fetchRandomGifButton = document.getElementById('fetch-random-gif');
    const randomGifArea = document.getElementById('random-gif-area');
    
    const searchQueryInput = document.getElementById('search-query');
    const searchGifButton = document.getElementById('search-gif-button');
    const searchResultsArea = document.getElementById('search-results-area');

    // Pobieranie losowego GIF-a
    async function fetchRandomGif() {
        randomGifArea.innerHTML = '<p>Ładowanie losowego GIF-a...</p>';
        try {
            const response = await fetch(RANDOM_API_URL); 
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || response.statusText);
            }
            const data = await response.json();
            const gif = data.data; 
            
            const gifUrl = gif.images ? gif.images.original.url : null; 
            
            randomGifArea.innerHTML = `
                <h2>Losowy GIF:</h2>
                <img src="${gifUrl}" alt="${gif.title || 'Losowy GIF'}">
            `;
            
        } catch (error) {
            console.error('Błąd pobierania losowego GIF-a:', error);
            randomGifArea.innerHTML = `<p style="color: red;">Błąd: ${error.message}</p>`;
        }
    }

    // Wyszukiwanie GIF-ów po frazie
    async function searchGifs() {
        const query = searchQueryInput.value.trim();
        const limit = 5; 
        
        if (!query) {
            searchResultsArea.innerHTML = '<p style="color: orange;">Proszę wprowadzić frazę do wyszukania.</p>';
            return;
        }

        searchResultsArea.innerHTML = '<p>Wyszukiwanie GIF-ów...</p>';

        try {
            const params = new URLSearchParams({
                q: query,
                limit: limit,
                offset: 0 
            });
            const url = `${SEARCH_API_URL}?${params.toString()}`;

            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || response.statusText);
            }
            
            const data = await response.json();
            const gifs = data.data;

            if (gifs.length === 0) {
                searchResultsArea.innerHTML = `<p>Nie znaleziono GIF-ów dla frazy "${query}".</p>`;
                return;
            }

            let htmlContent = `<p>Znaleziono: ${data.pagination.total_count} GIF-ów. Wyświetlanie ${gifs.length} pierwszych wyników:</p>`;
            htmlContent += '<div class="gif-grid">';
            
            gifs.forEach(gif => {
                htmlContent += `
                    <img src="${gif.images.fixed_width.url}" alt="${gif.title || 'GIF'}" title="${gif.title || 'GIF'}">
                `;
            });
            htmlContent += '</div>';

            searchResultsArea.innerHTML = htmlContent;

        } catch (error) {
            console.error('Błąd wyszukiwania GIF-ów:', error);
            searchResultsArea.innerHTML = `<p style="color: red;">Błąd: ${error.message}</p>`;
        }
    }


    // --- LISTENERY ---
    fetchRandomGifButton.addEventListener('click', fetchRandomGif);
    
    // Uruchomienie wyszukiwania
    searchGifButton.addEventListener('click', searchGifs); 
    
    // Domyślne ładowanie losowego GIF-a na start
    fetchRandomGif();

})();
