const backendUrl = `https://artistic-management-server.onrender.com`
let currentMusicPage = 1;
const limit = 10;

let editingMusicId = null;

// Check if user is authenticated and get role
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        window.location.href = 'index.html';
        return null;
    }

    document.getElementById('userRole').textContent = `Role: ${user.role}`;

    // Get the "Add Artist" button
    const addMusicBtn = document.getElementById('addMusicBtn');

    // Show button only if user.role is 'artist_manager'
    if (user.role === 'artist') {
        addMusicBtn.style.display = 'block';
    } else {
        addMusicBtn.style.display = 'none';
    }

    return token;
}

// Show/Hide sections
function showSection(sectionName) {
    const sections = ['users', 'artists', 'music'];
    sections.forEach(section => {
        const element = document.getElementById(`${section}Section`);
        if (element) {
            element.style.display = section === sectionName ? 'block' : 'none';
        }
    });
}

// Generic fetch function with authentication
async function authenticatedFetch(url, options = {}) {
    const token = checkAuth();
    if (!token) return null;

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },

    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
        return null;
    }
}


// Music CRUD
async function fetchMusic() {
    const result = await authenticatedFetch(
        `${backendUrl}/musics/?page=${currentMusicPage}&limit=${limit}`
    );

    if (result && result.success) {
        displayMusic(result.data.musics.data);
        updatePagination('music', result.data.meta);
    }
}

function displayMusic(musics) {

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const tbody = document.getElementById('musicTableBody');
    tbody.innerHTML = '';



    musics.forEach(music => {
        const tr = document.createElement('tr');

        const actionButtons = user.role === 'artist' ? `
        <td class="action-buttons">
            <button class="edit-btn" onclick="editMusic('${music.id}')">Edit</button>
            <button class="delete-btn" onclick="deleteMusic('${music.id}')">Delete</button>
        </td>
    ` : '';

        tr.innerHTML = `
            <td>${music.title}</td>
            <td>${music.album_name}</td>
            <td>${music.genre}</td>
            <td>${music.artist_name}</td>
            ${actionButtons}
        `;
        tbody.appendChild(tr);
    });
}

// Modal Functions
function openModal(modalId, title = 'Add') {
    document.getElementById(modalId).style.display = 'block';
    document.getElementById(`${modalId}Title`).textContent = title;
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.getElementById(`${modalId.replace('Modal', '')}Form`).reset();
    editingUserId = null;
    editingArtistId = null;
    editingMusicId = null;
}

// Pagination
function updatePagination(type, meta) {
    document.getElementById(`${type}CurrentPage`).textContent = `Page ${meta.page}`;
    document.getElementById(`${type}PrevPage`).disabled = meta.page === 1;
    document.getElementById(`${type}NextPage`).disabled = meta.page === meta.totalPages;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchMusic();

    // Music pagination
    document.getElementById('musicPrevPage').addEventListener('click', () => {
        if (currentMusicPage > 1) {
            currentMusicPage--;
            fetchMusic();
        }
    });

    document.getElementById('musicNextPage').addEventListener('click', () => {
        currentMusicPage++;
        fetchMusic();
    });


    document.getElementById('addMusicBtn').addEventListener('click', () => {
        openModal('musicModal', 'Add Music');
    });

    ;


    document.getElementById('musicForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            title: document.getElementById('musicTitle').value,
            album_name: document.getElementById('musicAlbum').value,
            genre: document.getElementById('musicGenre').value
        };

        const url = editingMusicId
            ? `${backendUrl}/musics/${editingMusicId}`
            : `${backendUrl}/musics`;

        const method = editingMusicId ? 'PATCH' : 'POST';

        const result = await authenticatedFetch(url, {
            method,
            body: JSON.stringify(formData)
        });

        if (result && result.success) {
            closeModal('musicModal');
            fetchMusic();
        }
    });


});



async function deleteMusic(id) {
    if (!confirm('Are you sure you want to delete this music?')) return;

    const result = await authenticatedFetch(`${backendUrl}/musics/${id}`, {
        method: 'DELETE'
    });

    if (result && result.success) {
        fetchMusic();
    }
}