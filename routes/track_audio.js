import { Router } from 'express';
import dotenv from 'dotenv';
//import { Track } from './database/database.js'; 

dotenv.config();

const trackAudioRouter = Router();

trackAudioRouter.get('/search', async (req, res) => {
    const { trackName, artistName } = req.query;

    if (!trackName || !artistName) {
        return res.status(400).send({ error: 'Track name and artist name are required' });
    }

    const query = `${trackName} ${artistName}`;
    const apiKey = process.env.YOUTUBE_API_KEY;

    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${apiKey}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch video from YouTube');
        }

        const data = await response.json();

        if (data.items.length === 0) {
            return res.status(404).send({ error: 'No video found' });
        }

        const video = data.items[0];
        const videoDetails = {
            //title: video.snippet.title,
            //description: video.snippet.description,
            //videoId: video.id.videoId,
            url: `https://www.youtube.com/watch?v=${video.id.videoId}`
        };

        res.send(videoDetails);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to fetch video from YouTube' });
    }
});

export default trackAudioRouter;
