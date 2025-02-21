import { Router } from 'express';
import axios from 'axios'; // dont used anymore -> unistall axios 
import dotenv from 'dotenv';
import { Track } from '../database/database.js'; 

dotenv.config();

const trackInfoRouter = Router();

let spotifyToken = null;
let tokenExpirationTime = null;

// Function to get a new Spotify token
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

// Middleware to ensure the Spotify token is active
const ensureSpotifyToken = async (req, res, next) => {
    if (!spotifyToken || Date.now() >= tokenExpirationTime) {
        await getSpotifyToken();
    }
    next();
};

// Endpoint to search for tracks by name and optionally by artist
trackInfoRouter.get('/search', ensureSpotifyToken, async (req, res) => {
    const { trackName, artistName } = req.query;

    if (!trackName) {
        return res.status(400).send({ error: 'Track name is required' });
    }

    // Build the search query
    let query = `track:${trackName}`;
    if (artistName) {
        query += ` artist:${artistName}`;
    }

    try {
        const queryParams = new URLSearchParams({
            q: query,
            type: 'track',
            limit: 5,
            market: 'ES'
        }).toString();

        const response = await fetch(`https://api.spotify.com/v1/search?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${spotifyToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tracks from Spotify');
        }

        const data = await response.json();
        const tracks = data.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists.map(artist => artist.name).join(', '),
            release_date: track.album.release_date
        }));

        res.send(tracks);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to fetch tracks from Spotify' });
    }
});

// Endpoint to get track details by track ID
trackInfoRouter.get('/track/:id', ensureSpotifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${spotifyToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch track details from Spotify');
        }

        const trackData = await response.json();
        const trackDetails = {
            id: trackData.id,
            name: trackData.name,
            artist: trackData.artists.map(artist => artist.name).join(', '),
            release_date: trackData.album.release_date,
            album_cover_url: trackData.album.images[0]?.url,
            preview_url: trackData.preview_url //using this for now but is not working
        };
        res.send(trackDetails);

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to fetch track details from Spotify' });
    }
});

trackInfoRouter.post("/", async (req, res) => {
    // get track information
    const { id, name, artist, release_date, album_cover_url, preview_url } = req.body;

    // if any is missing send "400 - Bad Request"
    if (!id || !name || !artist || !release_date || !album_cover_url) {
        return res.status(400).send({ error: 'Missing required information' });
    }

    const track = await Track.checkTrackExists(id);

    // there already exists a track with that id, send "409 - Conflict"
    if (track !== undefined) return res.status(409).send();

    try {
        await Track.createNewTrack(id, name, artist, release_date, album_cover_url, preview_url);
        
        // send "201 - Created"
        res.status(201).send();

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to store track information' });
    }
});

export default trackInfoRouter;