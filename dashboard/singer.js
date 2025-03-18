const backendUrl = `https://artistic-management-server.onrender.com/musics/artist/`;

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        window.location.href = 'index.html';
        return null;
    }

    document.getElementById('userRole').textContent = `Role: ${user.role}`;
    return token;
}

// Function to search users by username (using POST request)
async function searchUserByUsername(username) {
    console.log("Searching user by username");

    const token = checkAuth();
    if (!token) return;

    const url = `${backendUrl}search`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: username })
    });

    const result = await response.json();

    console.log(result.data);

    if (response.ok) {
        displayUserDetails(result.data);
    } else {
        alert('User not found');
    }
}

// Function to display user details on the page
// Function to display user details on the page
function displayUserDetails(data) {
    const userListDiv = document.getElementById('userList');
    userListDiv.innerHTML = ''; // Clear previous results

    if (data && data.songs) {
        data.songs.forEach(song => {
            const songDetails = `
                <div class="user-details" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 10px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <h3 class="text-xl font-semibold" style="font-size: 20px; color: #333;">${song.song_title}</h3>
                    <p style="font-size: 16px; color: #555;"><strong>Album Name:</strong> ${song.album_name}</p>
                    <p style="font-size: 16px; color: #555;"><strong>Genre:</strong> ${song.genre}</p>
                    <p style="font-size: 16px; color: #555;"><strong>Created At:</strong> ${new Date(song.song_created_at).toLocaleString()}</p>
                    <p style="font-size: 16px; color: #555;"><strong>Artist:</strong> ${song.first_name} ${song.last_name}</p>
                    <p style="font-size: 16px; color: #555;"><strong>Email:</strong> ${song.email}</p>
                </div>
            `;
            userListDiv.innerHTML += songDetails;
        });
    } else {
        userListDiv.innerHTML = `<p class="text-red-500" style="color: #e53e3e; font-size: 16px; text-align: center;">No user found or invalid data format</p>`;
    }
}

// Event listener for the search button
document.getElementById('searchButton').addEventListener('click', () => {
    const searchInput = document.getElementById('searchInput').value;
    if (searchInput) {
        searchUserByUsername(searchInput);
    } else {
        alert('Please enter a username to search.');
    }
});
