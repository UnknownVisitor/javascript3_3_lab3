import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Klucz GIPHY
const GIPHY_API_KEY = "SeByhE8GP6yFUpxQnO0LDJPWsCxigsq0";
const GIPHY_API_BASE = "https://api.giphy.com/v1/gifs";

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Funkcja pomocnicza PROXYFETCH
async function proxyFetch(apiUrl, res) {
  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: response.statusText,
        message: `Błąd API GIPHY. Status: ${response.status}.`,
        details: errorText.substring(0, 100),
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Błąd serwera proxy (wewnętrzny)", details: err.message });
  }
}

// === TRASY GIPHY ===

// Random GIF
app.get("/random", (req, res) => {
  const url = `${GIPHY_API_BASE}/random?api_key=${GIPHY_API_KEY}&rating=g`;
  proxyFetch(url, res);
});

// szukaj GIFów z palignacją
app.get("/search", (req, res) => {
  const { q, limit, offset } = req.query;
  if (!q) {
    return res
      .status(400)
      .json({ error: "Wymagany parametr 'q' (fraza wyszukiwania)." });
  }
  const url = `${GIPHY_API_BASE}/search?api_key=${GIPHY_API_KEY}&q=${q}&limit=${limit || 10}&offset=${offset || 0}&rating=g`;
  proxyFetch(url, res);
});

app.listen(PORT, () => {
  console.log(`Proxy działa na http://localhost:${PORT}`);
});
