let currentArtistPage = 1;
const limit = 10;
let editingArtistId = null;
const backendUrl = `http://localhost:5500`

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
    const addArtistBtn = document.getElementById('addArtistBtn');

    // Show button only if user.role is 'artist_manager'
    if (user.role === 'artist_manager') {
        addArtistBtn.style.display = 'block';
    } else {
        addArtistBtn.style.display = 'none';
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

// Artists CRUD
async function fetchArtists() {
    const result = await authenticatedFetch(
        `${backendUrl}/artists/?page=${currentArtistPage}&limit=${limit}`
    );

    if (result && result.success) {
        displayArtists(result.data.artists.data);
        updatePagination('artists', result.data.meta);
    }
}

function displayArtists(artists) {
    const tbody = document.getElementById('artistsTableBody');
    tbody.innerHTML = '';

    artists.forEach(artist => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${artist.first_name} ${artist.last_name}</td>
            <td>${artist.email}</td>
            <td>${artist.no_of_albums_released}</td>
            <td>${artist.first_release_year}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editArtist('${artist.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteArtist('${artist.id}')">Delete</button>
            </td>
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
    showSection('artists');
    fetchArtists();

    // Artists pagination
    document.getElementById('artistsPrevPage').addEventListener('click', () => {
        if (currentArtistPage > 1) {
            currentArtistPage--;
            fetchArtists();
        }
    });

    document.getElementById('artistsNextPage').addEventListener('click', () => {
        currentArtistPage++;
        fetchArtists();
    });

    document.getElementById('addArtistBtn').addEventListener('click', () => {
        openModal('artistModal', 'Add Artist');
    });

    document.getElementById('artistForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        console.log("artise form")

        const formData = {
            first_name: document.getElementById('artistFirstName').value,
            last_name: document.getElementById('artistLastName').value,
            email: document.getElementById('artistEmail').value,
            phone: document.getElementById('artistPhone').value,
            dob: document.getElementById('artistDob').value,
            gender: document.getElementById('artistGender').value,
            address: document.getElementById('artistAddress').value,
            password: document.getElementById('artistPassword').value,
            first_release_year: parseInt(document.getElementById('artistFirstReleaseYear').value),
            no_of_albums_released: parseInt(document.getElementById('artistAlbumsReleased').value),
            role: 'artist'
        };

        const url = editingArtistId
            ? `${backendUrl}/artists/${editingArtistId}`
            : `${backendUrl}/artists`;

        console.log(url)

        const method = editingArtistId ? 'PUT' : 'POST';

        if (!formData.password) {
            delete formData.password;
        }

        const result = await authenticatedFetch(url, {
            method,
            body: JSON.stringify(formData)
        });

        if (result && result.success) {
            closeModal('artistModal');
            fetchArtists();
        }
    });

});

async function editArtist(id) {
    const result = await authenticatedFetch(`${backendUrl}/artists/${id}`);

    if (result && result.success) {
        const artist = result.data;
        document.getElementById('artistFirstName').value = artist.first_name;
        document.getElementById('artistLastName').value = artist.last_name;
        document.getElementById('artistEmail').value = artist.email;
        document.getElementById('artistPhone').value = artist.phone;
        document.getElementById('artistDob').value = artist.dob.split('T')[0];
        document.getElementById('artistGender').value = artist.gender;
        document.getElementById('artistAddress').value = artist.address;
        document.getElementById('artistFirstReleaseYear').value = artist.first_release_year;
        document.getElementById('artistAlbumsReleased').value = artist.no_of_albums_released;
        document.getElementById('artistPassword').value = '';

        editingArtistId = id;
        openModal('artistModal', 'Edit Artist');
    }
}



async function deleteArtist(id) {
    if (!confirm('Are you sure you want to delete this artist?')) return;

    const result = await authenticatedFetch(`http://localhost:5500/artists/${id}`, {
        method: 'DELETE'
    });

    if (result && result.success) {
        fetchArtists();
    }
}

