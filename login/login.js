document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`https://artistic-management-server.onrender.com/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Store the token and user data
            localStorage.setItem('token', result?.data?.token);
            localStorage.setItem('user', JSON.stringify(result?.data?.user));

            let role = result?.data?.user.role
            if (role === 'artist_manager') {
                window.location.href = 'dashboard/artist.html';
            }
            else if (role === 'super_admin') {
                window.location.href = 'dashboard/users.html';
            }
            else {
                window.location.href = 'dashboard/music.html';
            }

        } else {
            alert(result.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login');
    }
});