import { Router } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const trackInfoRouter = Router();

let spotifyToken = null;
let tokenExpirationTime = null;

// Función para obtener un nuevo token de Spotify
const getSpotifyToken = async () => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        spotifyToken = response.data.access_token;
        tokenExpirationTime = Date.now() + response.data.expires_in * 1000; // Convert seconds to milliseconds
    } catch (error) {
        console.error('Failed to fetch Spotify token', error);
        throw new Error('Failed to fetch Spotify token');
    }
};

// Middleware para asegurarse de que el token de Spotify esté activo
const ensureSpotifyToken = async (req, res, next) => {
    if (!spotifyToken || Date.now() >= tokenExpirationTime) {
        await getSpotifyToken();
    }
    next();
};

// Endpoint para buscar canciones por nombre y opcionalmente por artista
trackInfoRouter.get('/search', ensureSpotifyToken, async (req, res) => {
    const { trackName, artistName } = req.query;

    if (!trackName) {
        return res.status(400).send({ error: 'Track name is required' });
    }

    // Construir la consulta de búsqueda
    let query = `track:${trackName}`;
    if (artistName) {
        query += ` artist:${artistName}`;
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/search', {
            headers: {
                'Authorization': `Bearer ${spotifyToken}`
            },
            params: {
                q: query,
                type: 'track',
                limit: 10,
                market: 'ES' // Añadir el parámetro de mercado español
            }
        });

        const tracks = response.data.tracks.items;
        res.send(tracks);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to fetch tracks from Spotify' });
    }
});

export default trackInfoRouter;