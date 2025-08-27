// frontend/static/app.js
const API_URL = 'http://127.0.0.1:8000/api'; // URL base da sua API Django
const BASE_URL = 'http://127.0.0.1:8000'; // URL base para mídias

document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DA PÁGINA DE LOGIN E REGISTRO ---
    if (document.getElementById('login-form')) {
        handleAuthPage();
    }

    // --- LÓGICA DA PÁGINA DO FEED ---
    if (document.querySelector('.feed-layout')) {
        handleFeedPage();
    }

    // --- LÓGICA DA PÁGINA DE PERFIL ---
     if (document.getElementById('profile-form')) {
        handleProfilePage();
    }
});

// Função para cuidar da página de autenticação (sem alterações)
function handleAuthPage() {
    // ... (seu código existente aqui, sem nenhuma mudança)
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
            window.location.reload(); // Recarrega a página para mostrar o login
        } catch (error) {
            document.getElementById('register-error').textContent = error.message;
        }
    });
}


// >>> Função do Feed ATUALIZADA <<<
async function handleFeedPage() {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const feedContainer = document.getElementById('feed-container');
    const newPostForm = document.getElementById('new-post-form');
    const logoutButton = document.getElementById('logout-button');

    // --- CARREGAR DADOS DO USUÁRIO LOGADO ---
    async function loadCurrentUserData() {
        try {
            const response = await fetch(`${API_URL}/profile/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Não foi possível carregar dados do usuário.');
            
            const user = await response.json();
            const defaultAvatar = 'static/icone.png';
            const userAvatarUrl = user.profile_picture ? `${BASE_URL}${user.profile_picture}` : defaultAvatar;

            // Atualiza a barra lateral
            document.getElementById('user-avatar-sidebar').src = userAvatarUrl;
            document.getElementById('user-name-sidebar').textContent = user.username;
            document.getElementById('user-username-sidebar').textContent = `@${user.username}`;
            
            // Atualiza a imagem no formulário de post
            document.getElementById('user-avatar-post-form').src = userAvatarUrl;

        } catch (error) {
            console.error(error.message);
        }
    }


    // --- FUNÇÃO PARA CARREGAR O FEED ---
    async function loadFeed() {
        try {
            const response = await fetch(`${API_URL}/feed/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                 window.location.href = 'index.html';
                 return;
            }
            if (!response.ok) throw new Error('Não foi possível carregar o feed.');

            const posts = await response.json();
            feedContainer.innerHTML = '';

            if (posts.length === 0) {
                 feedContainer.innerHTML = '<p style="padding: 15px;">Seu feed está vazio. Siga outros usuários para ver os posts deles aqui!</p>';
            }

            posts.forEach(post => {
    const postElement = document.createElement('article');
    postElement.className = 'post glass-container'; // Adiciona a classe de vidro
    
    const authorAvatar = post.author.profile_picture ? `${BASE_URL}${post.author.profile_picture}` : 'static/icone.png';
    const postDate = new Date(post.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit'});

    postElement.innerHTML = `
        <img src="${authorAvatar}" alt="Avatar de ${post.author.username}" class="post-avatar">
        <div class="post-body">
            <div class="post-header">
                <strong>${post.author.username}</strong>
                <span>@${post.author.username} • ${postDate}</span>
            </div>
            <p class="post-content">${post.content}</p>
            <div class="post-footer">
                <div class="action"><span class="material-symbols-outlined">chat_bubble_outline</span> 0</div>
                <div class="action"><span class="material-symbols-outlined">repeat</span> 0</div>
                <div class="action"><span class="material-symbols-outlined">favorite_border</span> 0</div>
                <div class="action"><span class="material-symbols-outlined">ios_share</span></div>
            </div>
        </div>
    `;
    feedContainer.appendChild(postElement);
});
        } catch (error) {
            feedContainer.innerHTML = `<p style="padding: 15px;">${error.message}</p>`;
        }
    }

    // Evento para criar um novo post
    newPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('post-content').value;
        if (!content.trim()) return; // Não posta se estiver vazio

        await fetch(`${API_URL}/posts/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });
        document.getElementById('post-content').value = '';
        loadFeed();
    });
    
    // Evento de Logout
    logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('accessToken');
        window.location.href = 'index.html';
    });


    // Carrega tudo ao iniciar a página
    loadCurrentUserData();
    loadFeed();
}

// Função para cuidar da página de perfil (sem alterações)
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
            profilePicPreview.src = `${BASE_URL}${data.profile_picture}`;
        } else {
            profilePicPreview.src = 'static/icone.png'; // Imagem padrão
        }
    }

    // Evento para salvar as alterações do perfil
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('username', document.getElementById('username').value);
        formData.append('bio', document.getElementById('bio').value);

        const imageInput = document.getElementById('profile_picture');
        if (imageInput.files[0]) {
            formData.append('profile_picture', imageInput.files[0]);
        }
        
        const response = await fetch(`${API_URL}/profile/`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if(response.ok) {
            alert("Perfil atualizado com sucesso!");
            loadProfileData();
        } else {
            alert("Erro ao atualizar o perfil.");
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
        
        if(response.ok) {
            alert("Senha alterada com sucesso!");
            passwordForm.reset();
        } else {
            const data = await response.json();
            alert(data.old_password || "Erro ao alterar a senha.");
        }
    });

    loadProfileData();
}