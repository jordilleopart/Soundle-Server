const songs = [
    { title: "Sweet Child O' Mine", artist: "Guns N' Roses" },
    { title: "November Rain", artist: "Guns N' Roses" },
    { title: "Livin' on a Prayer", artist: "Bon Jovi" },
    { title: "Wanted Dead or Alive", artist: "Bon Jovi" },
    { title: "Don't Stop Believin'", artist: "Journey" },
    { title: "Eye of the Tiger", artist: "Survivor" },
    { title: "Another Brick in the Wall", artist: "Pink Floyd" },
    { title: "Take on Me", artist: "A-ha" },
    { title: "Billie Jean", artist: "Michael Jackson" },
    { title: "Beat It", artist: "Michael Jackson" },
    { title: "Like a Prayer", artist: "Madonna" },
    { title: "Losing My Religion", artist: "R.E.M." },
    { title: "Everybody Hurts", artist: "R.E.M." },
    { title: "Under Pressure", artist: "Queen & David Bowie" },
    { title: "Radio Ga Ga", artist: "Queen" },
    { title: "I Want to Break Free", artist: "Queen" },
    { title: "We Will Rock You", artist: "Queen" },
    { title: "We Are the Champions", artist: "Queen" },
    { title: "The Final Countdown", artist: "Europe" },
    { title: "Jump", artist: "Van Halen" },
    { title: "Panama", artist: "Van Halen" },
    { title: "Here I Go Again", artist: "Whitesnake" },
    { title: "Is This Love", artist: "Whitesnake" },
    { title: "Every Breath You Take", artist: "The Police" },
    { title: "Roxanne", artist: "The Police" },
    { title: "Summer of '69", artist: "Bryan Adams" },
    { title: "Heaven", artist: "Bryan Adams" },
    { title: "Take My Breath Away", artist: "Berlin" },
    { title: "(I Just) Died in Your Arms", artist: "Cutting Crew" },
    { title: "Sweet Dreams (Are Made of This)", artist: "Eurythmics" },
    { title: "Tainted Love", artist: "Soft Cell" },
    { title: "You Give Love a Bad Name", artist: "Bon Jovi" }
];

async function searchSongId(title, artist) {
    const response = await fetch(`http://localhost:3000/track/search?trackName=${encodeURIComponent(title)}&artistName=${encodeURIComponent(artist)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return data.id || null;
}

async function getSongDetails(songId) {
    const response = await fetch(`http://localhost:3000/track/track/${songId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
}

async function searchYoutubeUrl(title, artist) {
    const response = await fetch(`http://localhost:3000/audio/search?trackName=${encodeURIComponent(title)}&artistName=${encodeURIComponent(artist)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return data.video_url || null;
}

async function insertSongIntoDB(song) {
    const response = await fetch('http://localhost:3000/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(song)
    });
    return response.ok;
}

async function main() {
    for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        const songId = await searchSongId(song.title, song.artist);
        if (!songId) continue;

        const songDetails = await getSongDetails(songId);
        if (!songDetails) continue;

        const youtubeUrl = await searchYoutubeUrl(song.title, song.artist);
        if (!youtubeUrl) continue;

        const songData = {
            id: songDetails.id,
            name: songDetails.name,
            artist: songDetails.artist,
            release_date: songDetails.release_date,
            album_cover_url: songDetails.album_cover_url,
            preview_url: youtubeUrl
        };
        print(songData);

        await insertSongIntoDB(songData);
        console.log(`Insertado: ${songDetails.name} - ${songDetails.artist}`);
    }
    console.log("Proceso completado.");
}

main().catch(console.error);