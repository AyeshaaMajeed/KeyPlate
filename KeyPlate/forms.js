// Save the registered users in local storage
function saveUser(user) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
}

// Validate registration form
function submitRegister() {
    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    let isValid = true;

    if (!name) {
        document.getElementById('name-error').innerText = "Name is required";
        document.getElementById('name-error').style.display = "block";
        isValid = false;
    } else {
        document.getElementById('name-error').style.display = "none";
    }

    if (!username) {
        document.getElementById('username-error').innerText = "Username is required";
        document.getElementById('username-error').style.display = "block";
        isValid = false;
    } else {
        document.getElementById('username-error').style.display = "none";
    }

    if (!email) {
        document.getElementById('register-email-error').innerText = "Email is required";
        document.getElementById('register-email-error').style.display = "block";
        isValid = false;
    } else {
        document.getElementById('register-email-error').style.display = "none";
    }

    if (!password) {
        document.getElementById('register-password-error').innerText = "Password is required";
        document.getElementById('register-password-error').style.display = "block";
        isValid = false;
    } else {
        document.getElementById('register-password-error').style.display = "none";
    }

    if (password !== confirmPassword) {
        document.getElementById('confirm-password-error').innerText = "Passwords do not match";
        document.getElementById('confirm-password-error').style.display = "block";
        isValid = false;
    } else {
        document.getElementById('confirm-password-error').style.display = "none";
    }

    if (isValid) {
        saveUser({ name, username, email, password });
        alert("Registration successful!");
        location.href = 'login.html';
    }
}

// Validate login form
function submitLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let user = users.find(user => user.email === email && user.password === password);

    if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        alert("Login successful!");
        location.href = 'home.html';
    } else {
        document.getElementById('email-error').innerText = "Invalid email or password";
        document.getElementById('email-error').style.display = "block";
        document.getElementById('password-error').innerText = "Invalid email or password";
        document.getElementById('password-error').style.display = "block";
    }
}

