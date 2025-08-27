// frontend/static/app.js
const API_URL = 'http://127.0.0.1:8000/api'; // URL base da sua API Django

document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DA PÁGINA DE LOGIN E REGISTRO ---
    if (document.getElementById('login-form')) {
        handleAuthPage();
    }

    // --- LÓGICA DA PÁGINA DO FEED ---
    if (document.getElementById('feed-container')) {
        handleFeedPage();
    }
});

// Função para cuidar da página de autenticação
function handleAuthPage() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Alternar entre formulários de login e registro
    showRegisterLink.addEventListener('click', () => {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });
    showLoginLink.addEventListener('click', () => {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Evento de Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_URL}/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) throw new Error('Usuário ou senha inválidos.');

            const data = await response.json();
            sessionStorage.setItem('accessToken', data.access); // Salva o token
            window.location.href = 'feed.html'; // Redireciona para o feed
        } catch (error) {
            document.getElementById('login-error').textContent = error.message;
        }
    });

    // Evento de Registro
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch(`${API_URL}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (!response.ok) throw new Error('Erro ao registrar. Tente outro usuário.');

            alert('Usuário registrado com sucesso! Faça o login.');
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        } catch (error) {
            document.getElementById('register-error').textContent = error.message;
        }
    });
}

// Função para cuidar da página do feed
function handleFeedPage() {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
        window.location.href = 'index.html'; // Se não está logado, volta para o login
        return;
    }

    const feedContainer = document.getElementById('feed-container');
    const newPostForm = document.getElementById('new-post-form');
    const logoutButton = document.getElementById('logout-button');

    // Função para buscar e exibir os posts
    async function loadFeed() {
        try {
            const response = await fetch(`${API_URL}/feed/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) { // Token expirou ou inválido
                 window.location.href = 'index.html';
                 return;
            }
            const posts = await response.json();
            feedContainer.innerHTML = ''; // Limpa o feed antes de adicionar novos posts

            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'post';
                postElement.innerHTML = `
                    <p class="post-author"><strong>@${post.author.username}</strong></p>
                    <p class="post-content">${post.content}</p>
                `;
                feedContainer.appendChild(postElement);
            });
        } catch (error) {
            feedContainer.innerHTML = '<p>Não foi possível carregar o feed.</p>';
        }
    }

    // Evento para criar um novo post
    newPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('post-content').value;

        await fetch(`${API_URL}/posts/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });
        document.getElementById('post-content').value = ''; // Limpa o campo
        loadFeed(); // Recarrega o feed para mostrar o novo post
    });
    
    // Evento de Logout
    logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('accessToken');
        window.location.href = 'index.html';
    });


    // Carrega o feed assim que a página é aberta
    loadFeed();
}