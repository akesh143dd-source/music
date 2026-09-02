// Supabase Configuration
const supabaseUrl = 'https://ghglgtmfwcjophzulvgg.supabase.co';
const supabaseKey = 'sb_publishable_-u4qK2iK-3-IbnFrN-9p0w_oAjKGLmy';
const supabaseDb = window.supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const songsGrid = document.getElementById('songsGrid');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');

// Player Elements
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progress = document.getElementById('progress');
const progressWrapper = document.getElementById('progressWrapper');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const volumeSlider = document.getElementById('volumeSlider');
const muteIcon = document.getElementById('muteIcon');
const playerCover = document.getElementById('playerCover');
const playerInfo = document.getElementById('playerInfo');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');

// State
let allSongs = [];
let currentSongIndex = -1;
let isPlaying = false;

// Initialize
async function init() {
    await fetchSongs();
    setupEventListeners();
}

// Fetch songs from Supabase
async function fetchSongs() {
    try {
        const { data, error } = await supabaseDb
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        allSongs = data || [];
        renderSongs(allSongs);
    } catch (error) {
        console.error('Error fetching songs:', error);
        loading.textContent = 'Error loading songs. Please try again.';
    }
}

// Render songs to the grid
function renderSongs(songs) {
    loading.style.display = 'none';
    
    if (songs.length === 0) {
        songsGrid.innerHTML = '<div class="loading">No songs found.</div>';
        return;
    }

    songsGrid.innerHTML = songs.map((song, index) => {
        const cover = song.cover_url || 'https://via.placeholder.com/300?text=No+Cover';
        return `
            <div class="song-card" data-index="${index}" onclick="playSongFromGrid(${index})">
                <div class="cover-wrapper">
                    <img src="${cover}" alt="${song.title}">
                    <div class="play-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="song-info">
                    <h4>${song.title}</h4>
                    <p>${song.artist}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allSongs.filter(song => 
        song.title.toLowerCase().includes(term) || 
        song.artist.toLowerCase().includes(term) ||
        (song.album && song.album.toLowerCase().includes(term))
    );
    renderSongs(filtered);
});

// Player Logic
function playSongFromGrid(index) {
    currentSongIndex = index;
    loadSong(allSongs[currentSongIndex]);
    playSong();
}

function loadSong(song) {
    audioPlayer.src = song.audio_url;
    playerTitle.textContent = song.title;
    playerArtist.textContent = song.artist;
    playerCover.src = song.cover_url || 'https://via.placeholder.com/60?text=No+Cover';
    
    playerCover.classList.remove('hidden');
    playerInfo.classList.remove('hidden');
}

function playSong() {
    isPlaying = true;
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    const playPromise = audioPlayer.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.error("Playback failed. The audio URL might be invalid or blocked:", error);
            isPlaying = false;
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            alert("Error playing audio: The URL might be invalid, or the audio format is unsupported.");
        });
    }
}

function pauseSong() {
    isPlaying = false;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    audioPlayer.pause();
}

function prevSong() {
    if (allSongs.length === 0) return;
    currentSongIndex--;
    if (currentSongIndex < 0) {
        currentSongIndex = allSongs.length - 1;
    }
    loadSong(allSongs[currentSongIndex]);
    if (isPlaying) playSong();
}

function nextSong() {
    if (allSongs.length === 0) return;
    currentSongIndex++;
    if (currentSongIndex > allSongs.length - 1) {
        currentSongIndex = 0;
    }
    loadSong(allSongs[currentSongIndex]);
    if (isPlaying) playSong();
}

function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    
    if (isNaN(duration)) return;
    
    // Update progress bar
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    
    // Update time strings
    currentTimeEl.textContent = formatTime(currentTime);
    totalTimeEl.textContent = formatTime(duration);
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    
    if (isNaN(duration)) return;
    
    audioPlayer.currentTime = (clickX / width) * duration;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function setupEventListeners() {
    // Play/Pause
    playBtn.addEventListener('click', () => {
        if (currentSongIndex === -1 && allSongs.length > 0) {
            currentSongIndex = 0;
            loadSong(allSongs[0]);
        }
        if (currentSongIndex === -1) return;
        
        isPlaying ? pauseSong() : playSong();
    });
    
    // Prev/Next
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    
    // Audio events
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', nextSong);
    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
    });
    
    // Progress click
    progressWrapper.addEventListener('click', setProgress);
    
    // Volume
    volumeSlider.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value;
        if (audioPlayer.volume === 0) {
            muteIcon.className = 'fas fa-volume-mute';
        } else if (audioPlayer.volume < 0.5) {
            muteIcon.className = 'fas fa-volume-down';
        } else {
            muteIcon.className = 'fas fa-volume-up';
        }
    });
    
    muteIcon.addEventListener('click', () => {
        if (audioPlayer.volume > 0) {
            audioPlayer.dataset.volume = audioPlayer.volume;
            audioPlayer.volume = 0;
            volumeSlider.value = 0;
            muteIcon.className = 'fas fa-volume-mute';
        } else {
            const prevVol = audioPlayer.dataset.volume || 1;
            audioPlayer.volume = prevVol;
            volumeSlider.value = prevVol;
            muteIcon.className = 'fas fa-volume-up';
        }
    });
}

// Start app
init();
