// Supabase Configuration
const supabaseUrl = 'https://ghglgtmfwcjophzulvgg.supabase.co';
const supabaseKey = 'sb_publishable_-u4qK2iK-3-IbnFrN-9p0w_oAjKGLmy';
const supabaseDb = window.supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const songForm = document.getElementById('songForm');
const songIdInput = document.getElementById('songId');
const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const albumInput = document.getElementById('album');
const coverUrlInput = document.getElementById('coverUrl');
const audioUrlInput = document.getElementById('audioUrl');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const statusMessage = document.getElementById('statusMessage');
const adminSongsList = document.getElementById('adminSongsList');

// Initialize
async function init() {
    await fetchAdminSongs();
    
    songForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', resetForm);
}

// Fetch songs for admin list
async function fetchAdminSongs() {
    try {
        const { data, error } = await supabaseDb
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        renderAdminSongs(data || []);
    } catch (error) {
        console.error('Error fetching admin songs:', error);
        adminSongsList.innerHTML = '<div class="error">Failed to load songs.</div>';
    }
}

// Render songs in admin panel
function renderAdminSongs(songs) {
    if (songs.length === 0) {
        adminSongsList.innerHTML = '<div>No songs added yet.</div>';
        return;
    }

    adminSongsList.innerHTML = songs.map(song => {
        const cover = song.cover_url || 'https://via.placeholder.com/50?text=No+Cover';
        return `
            <div class="admin-song-item">
                <div class="admin-song-details">
                    <img src="${cover}" alt="Cover">
                    <div>
                        <h4>${song.title}</h4>
                        <p style="font-size: 13px; color: var(--text-muted)">${song.artist}</p>
                    </div>
                </div>
                <div class="admin-song-actions">
                    <button class="btn secondary" onclick="editSong('${song.id}')" style="padding: 8px 12px; font-size: 13px;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn danger" onclick="deleteSong('${song.id}')" style="padding: 8px 12px; font-size: 13px;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Handle Form Submit (Add / Edit)
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = songIdInput.value;
    const songData = {
        title: titleInput.value.trim(),
        artist: artistInput.value.trim(),
        album: albumInput.value.trim() || null,
        cover_url: coverUrlInput.value.trim() || null,
        audio_url: audioUrlInput.value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
        if (id) {
            // Update existing
            const { error } = await supabaseDb
                .from('songs')
                .update(songData)
                .eq('id', id);
                
            if (error) throw error;
            showStatus('Song updated successfully!', 'success');
        } else {
            // Insert new
            const { error } = await supabaseDb
                .from('songs')
                .insert([songData]);
                
            if (error) throw error;
            showStatus('Song added successfully!', 'success');
        }
        
        resetForm();
        fetchAdminSongs();
    } catch (error) {
        console.error('Error saving song:', error);
        showStatus('Error saving song. Check console.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = id ? 'Update Song' : 'Add Song';
    }
}

// Setup Edit Mode
async function editSong(id) {
    try {
        const { data, error } = await supabaseDb
            .from('songs')
            .select('*')
            .eq('id', id)
            .single();
            
        if (error) throw error;
        
        // Populate form
        songIdInput.value = data.id;
        titleInput.value = data.title;
        artistInput.value = data.artist;
        albumInput.value = data.album || '';
        coverUrlInput.value = data.cover_url || '';
        audioUrlInput.value = data.audio_url;
        
        // Change UI to edit mode
        formTitle.textContent = 'Edit Song';
        submitBtn.textContent = 'Update Song';
        cancelBtn.classList.remove('hidden');
        
        // Scroll to form
        document.querySelector('.admin-form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error fetching song for edit:', error);
        showStatus('Error loading song data.', 'error');
    }
}

// Delete Song
async function deleteSong(id) {
    if (!confirm('Are you sure you want to delete this song?')) return;
    
    try {
        const { error } = await supabaseDb
            .from('songs')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        
        showStatus('Song deleted successfully!', 'success');
        fetchAdminSongs();
    } catch (error) {
        console.error('Error deleting song:', error);
        showStatus('Error deleting song.', 'error');
    }
}

// Reset Form
function resetForm() {
    songForm.reset();
    songIdInput.value = '';
    formTitle.textContent = 'Add New Song';
    submitBtn.textContent = 'Add Song';
    cancelBtn.classList.add('hidden');
}

// Show Status Message
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    setTimeout(() => {
        statusMessage.className = 'status-message';
        statusMessage.style.display = 'none';
        // force reflow hack if needed, or just let display none handle it
    }, 4000);
}

// Start admin app
init();
