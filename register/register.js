document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault()


    const formData = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        address: document.getElementById('address').value,
        password: document.getElementById('password').value,
        role: 'super_admin'

    };

    const registerButton = document.getElementById('registerBtn');

    // Show loading state
    registerButton.disabled = true;
    registerButton.textContent = 'Register....';


    try {
        const response = await fetch('https://artistic-management-server.onrender.com/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        const data = await response.json();

        if (response.ok) {
            alert('Registration successful!');
            window.location.href = '../index.html';
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration');
    }
    finally {

        registerButton.disabled = false;
        registerButton.textContent = 'Register';
    }
})