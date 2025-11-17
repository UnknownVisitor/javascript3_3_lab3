(function () {
    // --- URLs ---
    const RANDOM_API_URL = "/random"; 
    const SEARCH_API_URL = "/search"; 

    // --- Elementy DOM ---
    const fetchRandomGifButton = document.getElementById('fetch-random-gif');
    const randomGifArea = document.getElementById('random-gif-area');

    const searchQueryInput = document.getElementById('search-query');
    const limitInput = document.getElementById('limit');
    const searchGifButton = document.getElementById('search-gif-button');

    const searchStatusText = document.getElementById('search-status-text');
    const gifGridContainer = document.getElementById('gif-grid-container'); 

    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfoSpan = document.getElementById('page-info');

    // Stan paginacji
    let currentOffset = 0;
    // Zmieniamy defaultLimit na stałą, aby kontrolować limit tylko w formularzu
    const defaultLimit = 5; 


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

    // Wyszukiwanie GIF-ów z paginacją
    async function searchGifs(offset) {
        const query = searchQueryInput.value.trim();
        // Pobieramy limit z inputu
        const limit = parseInt(limitInput.value) || defaultLimit; 

        if (!query) {
            searchStatusText.innerHTML = '<p style="color: orange;">Proszę wprowadzić frazę do wyszukania.</p>';
            gifGridContainer.innerHTML = '';
            updatePaginationControls(0, 0, 0);
            return;
        }

        currentOffset = offset;
        searchStatusText.textContent = 'Wyszukiwanie GIF-ów...';
        gifGridContainer.innerHTML = '';


        try {
            const params = new URLSearchParams({
                q: query,
                limit: limit,
                offset: offset
            });
            const url = `${SEARCH_API_URL}?${params.toString()}`;

            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || response.statusText);
            }

            const data = await response.json();

            const gifs = data.data;
            const pagination = data.pagination;
            const totalCount = pagination.total_count;
            // Poprawna kalkulacja stron
            const totalPages = Math.ceil(totalCount / limit); 
            const currentPage = Math.floor(offset / limit) + 1;

            if (gifs.length === 0) {
                searchStatusText.innerHTML = `<p style="color: red;">Nie znaleziono GIF-ów dla frazy "${query}".</p>`;
                updatePaginationControls(0, 0, limit);
                return;
            }

            searchStatusText.textContent = `Znaleziono: ${totalCount} GIF-ów. Wyświetlanie ${gifs.length} GIF-ów:`;

            let htmlContent = '';
            gifs.forEach(gif => {
                htmlContent += `
                    <img src="${gif.images.fixed_width.url}" alt="${gif.title || 'GIF'}" title="${gif.title || 'GIF'}">
                `;
            });

            gifGridContainer.innerHTML = htmlContent;
            updatePaginationControls(currentPage, totalPages, limit);

        } catch (error) {
            console.error('Błąd wyszukiwania GIF-ów:', error);
            searchStatusText.innerHTML = `<p style="color: red;">Błąd: ${error.message}</p>`;
            gifGridContainer.innerHTML = '';
            updatePaginationControls(0, 0, limit);
        }
    }

    // Obsługa paginacji (Com3_3.3)
    function updatePaginationControls(currentPage, totalPages, limit) {
        pageInfoSpan.textContent = totalPages > 0 ? `Strona ${currentPage} z ${totalPages}` : `Brak wyników`;

        prevPageButton.disabled = currentPage <= 1;
        // Używamy limitu do sprawdzenia, czy mamy jeszcze wyniki (API GIPHY nie zawsze podaje total_count poprawnie)
        nextPageButton.disabled = currentOffset + limit >= totalPages * limit && totalPages > 0; 
        // LUB starsza logika: nextPageButton.disabled = currentPage >= totalPages;

        if (totalPages > 0) {
            // KLUCZOWA ZMIANA: Używamy limitu z aktualnego zapytania do kalkulacji offsetu
            prevPageButton.onclick = () => searchGifs(currentOffset - limit);
            nextPageButton.onclick = () => searchGifs(currentOffset + limit);
        } else {
            prevPageButton.onclick = null;
            nextPageButton.onclick = null;
        }
    }


    // --- LISTENERY ---
    fetchRandomGifButton.addEventListener('click', fetchRandomGif);

    // Po kliknięciu "Szukaj" zawsze zaczynamy od offsetu 0
    searchGifButton.addEventListener('click', () => searchGifs(0)); 

    searchQueryInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') searchGifs(0);
    });


    fetchRandomGif();
    searchGifs(0); 
})();