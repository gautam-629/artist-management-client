let currentUserPage = 1;
let editingUserId = null;
const limit = 10;
const backendUrl = `http://localhost:5500`

// Check if user is authenticated and get role
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        window.location.href = '../index.html';
        return null;
    }

    document.getElementById('userRole').textContent = `Role: ${user.role}`;


    return token;
}

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

// Modal Functions
function openModal(modalId, title = 'Add') {
    document.getElementById(modalId).style.display = 'block';
    document.getElementById(`${modalId}Title`).textContent = title;
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.getElementById(`${modalId.replace('Modal', '')}Form`).reset();
    editingUserId = null;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchUsers();

    // Users pagination
    document.getElementById('usersPrevPage').addEventListener('click', () => {
        if (currentUserPage > 1) {
            currentUserPage--;
            fetchUsers();
        }
    });

    document.getElementById('usersNextPage').addEventListener('click', () => {
        currentUserPage++;
        fetchUsers();
    });


    // Add buttons
    document.getElementById('addUserBtn').addEventListener('click', () => {
        openModal('userModal', 'Add User');
    });


    // Form submissions
    document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            first_name: document.getElementById('modalFirstName').value,
            last_name: document.getElementById('modalLastName').value,
            email: document.getElementById('modalEmail').value,
            phone: document.getElementById('modalPhone').value,
            dob: document.getElementById('modalDob').value,
            gender: document.getElementById('modalGender').value,
            address: document.getElementById('modalAddress').value,
            password: document.getElementById('modalPassword').value
        };

        if (editingUserId) {
            if (!confirm('Are you sure you want to Update this user?')) return;
        }

        const url = editingUserId
            ? `${backendUrl}/users/${editingUserId}`
            : 'http://localhost:5500/users';

        const method = editingUserId ? 'PUT' : 'POST';

        if (!formData.password) {
            delete formData.password;
        }

        const result = await authenticatedFetch(url, {
            method,
            body: JSON.stringify(formData)
        });

        if (result && result.success) {
            closeModal('userModal');
            alert(result.message)
            fetchUsers();
        }
    });
});

// Edit functions
async function editUser(id) {

    const result = await authenticatedFetch(`${backendUrl}/users/${id}`);

    if (result && result.success) {
        const user = result.data;
        document.getElementById('modalFirstName').value = user.first_name;
        document.getElementById('modalLastName').value = user.last_name;
        document.getElementById('modalEmail').value = user.email;
        document.getElementById('modalPhone').value = user.phone;
        document.getElementById('modalDob').value = user.dob.split('T')[0];
        document.getElementById('modalGender').value = user.gender;
        document.getElementById('modalAddress').value = user.address;
        document.getElementById('modalPassword').value = '';

        editingUserId = id;
        openModal('userModal', 'Edit User');
    }
}

// Delete functions
async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const result = await authenticatedFetch(`${backendUrl}/users/${id}`, {
        method: 'DELETE'
    });

    if (result && result.success) {
        fetchUsers();
    }
}

// Pagination
function updatePagination(type, meta) {
    document.getElementById(`${type}CurrentPage`).textContent = `Page ${meta.page}`;
    document.getElementById(`${type}PrevPage`).disabled = meta.page === 1;
    document.getElementById(`${type}NextPage`).disabled = meta.page === meta.totalPages;
}


async function fetchUsers() {
    const result = await authenticatedFetch(
        `http://localhost:5500/users/?page=${currentUserPage}&limit=${limit}`
    );
    if (result && result.success) {
        displayUsers(result.data.users);
        updatePagination('users', result.data.meta);
    }
}

function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.first_name} ${user.last_name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.role}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editUser('${user.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
