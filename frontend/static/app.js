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

    // --- LÓGICA DA PÁGINA DE PERFIL ---
     if (document.getElementById('profile-form')) {
        handleProfilePage();
    }
});

// Função para cuidar da página de autenticação
function handleAuthPage() {
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Alternar entre formulários de login e registro
     showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'block';
    });
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerContainer.style.display = 'none';
        loginContainer.style.display = 'block';
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

function handleProfilePage() {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const profilePicPreview = document.getElementById('profile-pic-preview');

    // Carrega os dados atuais do perfil
    async function loadProfileData() {
        const response = await fetch(`${API_URL}/profile/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        document.getElementById('username').value = data.username;
        document.getElementById('bio').value = data.bio || '';
        if (data.profile_picture) {
            // A URL completa da imagem é o endereço do backend + a URL da mídia
            profilePicPreview.src = `http://127.0.0.1:8000${data.profile_picture}`;
        } else {
            profilePicPreview.src = 'https://via.placeholder.com/100'; // Imagem padrão
        }
    }

    // Evento para salvar as alterações do perfil
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Usamos FormData para enviar texto e arquivos juntos
        const formData = new FormData();
        formData.append('username', document.getElementById('username').value);
        formData.append('bio', document.getElementById('bio').value);

        const imageInput = document.getElementById('profile_picture');
        if (imageInput.files[0]) {
            formData.append('profile_picture', imageInput.files[0]);
        }
        
        const response = await fetch(`${API_URL}/profile/`, {
            method: 'PUT', // ou PATCH se quiser atualizações parciais
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData // Não precisa de 'Content-Type', o navegador define automaticamente para FormData
        });

        if(response.ok) {
            document.getElementById('profile-success').textContent = "Perfil atualizado com sucesso!";
            loadProfileData(); // Recarrega os dados para mostrar a nova foto
        }
    });

    // Evento para alterar a senha
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const old_password = document.getElementById('old_password').value;
        const new_password = document.getElementById('new_password').value;

        const response = await fetch(`${API_URL}/profile/change-password/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ old_password, new_password })
        });
        
        const data = await response.json();
        
        if(response.ok) {
            document.getElementById('password-success').textContent = "Senha alterada com sucesso!";
            document.getElementById('password-error').textContent = "";
            passwordForm.reset();
        } else {
            document.getElementById('password-error').textContent = data.old_password || "Erro ao alterar a senha.";
            document.getElementById('password-success').textContent = "";
        }
    });

    loadProfileData();
}