// frontend/static/app.js
let API_URL = 'https://JoaoVBonifacio.pythonanywhere.com/api';
let BASE_URL = 'https://JoaoVBonifacio.pythonanywhere.com';

// Verifica se estamos em ambiente de desenvolvimento local (rodando com o Live Server)
if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
  API_URL = 'http://127.0.0.1:8000/api';
  BASE_URL = 'http://127.0.0.1:8000';
}

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

    // --- CORREÇÃO: DECLARE AS VARIÁVEIS DE ELEMENTOS AQUI NO TOPO ---
    const feedContainer = document.getElementById('feed-container');
    const newPostForm = document.getElementById('new-post-form');
    const logoutButton = document.getElementById('logout-button');
    const usersContainer = document.querySelector('.who-to-follow-box ul');

    // Variável para guardar a lista de quem o usuário logado segue
    let currentUserFollowingIds = [];

    // --- CARREGAR DADOS DO USUÁRIO LOGADO (ATUALIZADA) ---
    async function loadCurrentUserData() {
        try {
            const response = await fetch(`${API_URL}/profile/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Não foi possível carregar dados do usuário.');
            
            const user = await response.json();
            
            // GUARDA A INFORMAÇÃO MAIS IMPORTANTE
            currentUserFollowingIds = user.following || [];

            const defaultAvatar = 'static/icone.png';
            const userAvatarUrl = user.profile_picture ? user.profile_picture : defaultAvatar;

            document.getElementById('user-avatar-sidebar').src = userAvatarUrl;
            document.getElementById('user-name-sidebar').textContent = user.username;
            document.getElementById('user-username-sidebar').textContent = `@${user.username}`;
            document.getElementById('user-avatar-post-form').src = userAvatarUrl;

        } catch (error) {
            console.error(error.message);
        }
    }

    // --- FUNÇÃO PARA CARREGAR O FEED (sem alterações) ---
    async function loadFeed() {
        const feedContainer = document.getElementById('feed-container');
        try {
            // ... (o código dentro desta função continua exatamente o mesmo)
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
                postElement.className = 'post glass-container';
                const authorAvatar = post.author.profile_picture ? post.author.profile_picture : 'static/icone.png';
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
            <div class="action action-comment">
                <span class="material-symbols-outlined">chat_bubble_outline</span>
                <span class="comment-count">${post.comments_count}</span>
            </div>
            <div class="action action-retweet">
                <span class="material-symbols-outlined">repeat</span> 0
            </div>
            <div class="action action-like" data-post-id="${post.id}">
                <span class="material-symbols-outlined like-icon">
                    ${post.user_has_liked ? 'favorite' : 'favorite_border'}
                </span>
                <span class="like-count">${post.likes_count}</span>
            </div>
            <div class="action action-share">
                <span class="material-symbols-outlined">ios_share</span>
            </div>
        </div> </div>
`;
                feedContainer.appendChild(postElement);
            });
        } catch (error) {
            feedContainer.innerHTML = `<p style="padding: 15px;">${error.message}</p>`;
        }
    }

    // --- FUNÇÃO PARA CARREGAR USUÁRIOS (ATUALIZADA) ---
    async function loadUsers() {
        const usersContainer = document.querySelector('.who-to-follow-box ul');
        if (!usersContainer) return;

        try {
            const usersResponse = await fetch(`${API_URL}/users/`, { headers: { 'Authorization': `Bearer ${token}` }});
            const users = await usersResponse.json();

            usersContainer.innerHTML = '';
            users.forEach(user => {
                // AGORA USAMOS A VARIÁVEL CONFIÁVEL
                const isFollowing = currentUserFollowingIds.includes(user.id);
                
                const userAvatar = user.profile_picture ? user.profile_picture : 'static/icone.png';
                const userElement = document.createElement('li');
                userElement.innerHTML = `
                    <img src="${userAvatar}" alt="Avatar de ${user.username}">
                    <div class="user-info">
                        <strong>${user.username}</strong>
                        <span>@${user.username}</span>
                    </div>
                    <button class="follow-button" data-user-id="${user.id}" data-following="${isFollowing}">
                        ${isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>
                `;
                usersContainer.appendChild(userElement);
            });
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        }
    }

    // --- EVENT LISTENER PARA SEGUIR/DEIXAR DE SEGUIR (ATUALIZADO) ---
    document.querySelector('.right-sidebar').addEventListener('click', async (e) => {
        if (e.target && e.target.classList.contains('follow-button')) {
            const button = e.target;
            const userId = parseInt(button.dataset.userId); // Converte para número
            const isFollowing = button.dataset.following === 'true';

            const method = isFollowing ? 'DELETE' : 'POST';

            try {
                const response = await fetch(`${API_URL}/users/${userId}/follow/`, {
                    method: method,
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    // ATUALIZA NOSSA "FONTE DA VERDADE" LOCALMENTE
                    if (isFollowing) {
                        // Remove o ID da lista
                        currentUserFollowingIds = currentUserFollowingIds.filter(id => id !== userId);
                    } else {
                        // Adiciona o ID na lista
                        currentUserFollowingIds.push(userId);
                    }
                    
                    // ATUALIZA O BOTÃO
                    button.dataset.following = !isFollowing;
                    button.textContent = !isFollowing ? 'Seguindo' : 'Seguir';
                    
                    // RECARREGA APENAS O FEED
                    loadFeed();
                }
            } catch (error) {
                console.error('Erro ao seguir/deixar de seguir:', error);
            }
        }
    });

    // --- EVENT LISTENERS DE POST E LOGOUT (sem alterações) ---
    document.getElementById('new-post-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('post-content').value;
        if (!content.trim()) return;
        await fetch(`${API_URL}/posts/create/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify({ content })
        });
        document.getElementById('post-content').value = '';
        loadFeed();
    });
    document.getElementById('logout-button').addEventListener('click', () => {
        sessionStorage.removeItem('accessToken');
        window.location.href = 'index.html';
    });

    // --- EVENT LISTENER PARA CURTIR POSTS ---
    feedContainer.addEventListener('click', async (e) => {
    // Procura por um elemento pai com a classe 'action-like'
        const likeButton = e.target.closest('.action-like');
        if (!likeButton) return;

        const postId = likeButton.dataset.postId;
        const token = sessionStorage.getItem('accessToken');

        try {
            const response = await fetch(`${API_URL}/posts/${postId}/like/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                // Atualiza o contador de likes e o ícone do coração
                const likeCountElement = likeButton.querySelector('.like-count');
                const likeIconElement = likeButton.querySelector('.like-icon');
            
                likeCountElement.textContent = data.likes_count;
                likeIconElement.textContent = data.liked ? 'favorite' : 'favorite_border';
            }
        } catch (error) {
            console.error("Erro ao curtir o post:", error);
        }
    });

    // --- LÓGICA DO MODAL DE COMENTÁRIOS ---
    const commentModalOverlay = document.getElementById('comment-modal-overlay');
    const closeCommentModalBtn = document.getElementById('close-comment-modal');
    let activePostId = null;

    // Função para abrir o modal
   async function openCommentModal(postId) {
    activePostId = postId;
    const modalPostContainer = document.getElementById('modal-post-container');
    const modalCommentsList = document.getElementById('modal-comments-list');
    
    // Limpa conteúdo anterior
    modalPostContainer.innerHTML = 'Carregando post...';
    modalCommentsList.innerHTML = 'Carregando comentários...';
    commentModalOverlay.classList.remove('hidden');

    // --- NOVO: BUSCA E RENDERIZA O POST ORIGINAL NO MODAL ---
    const postResponse = await fetch(`${API_URL}/feed/?post_id=${postId}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const postData = await postResponse.json();
    const originalPost = postData.results ? postData.results[0] : postData[0]; // Ajuste para o formato da API (array ou results)

    if (originalPost) {
        const authorAvatar = originalPost.author.profile_picture ? originalPost.author.profile_picture : 'static/icone.png';
        const postDate = new Date(originalPost.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit'});
        modalPostContainer.innerHTML = `
            <div class="post modal-original-post">
                <img src="${authorAvatar}" alt="Avatar de ${originalPost.author.username}" class="post-avatar">
                <div class="post-body">
                    <div class="post-header">
                        <strong>${originalPost.author.username}</strong>
                        <span>@${originalPost.author.username} • ${postDate}</span>
                    </div>
                    <p class="post-content">${originalPost.content}</p>
                </div>
            </div>
        `;
    } else {
        modalPostContainer.innerHTML = '<p>Não foi possível carregar o post original.</p>';
    }
    // --- FIM DO NOVO BLOCO ---


    // Busca os comentários e o post
    const response = await fetch(`${API_URL}/posts/${postId}/comments/`, { headers: { 'Authorization': `Bearer ${token}` } });
    const comments = await response.json();
    
    // Renderiza os comentários
    modalCommentsList.innerHTML = '';
    if (comments.length === 0) {
        modalCommentsList.innerHTML = '<p class="no-comments-message">Nenhum comentário ainda. Seja o primeiro a responder!</p>';
    } else {
        comments.forEach(comment => {
            const commentEl = document.createElement('div');
            commentEl.className = 'post comment-item glass-container'; // Adicione uma nova classe para estilizar
            const commentAuthorAvatar = comment.author.profile_picture ? comment.author.profile_picture : 'static/icone.png';
            const commentDate = new Date(comment.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit'});
            commentEl.innerHTML = `
                <img src="${commentAuthorAvatar}" alt="Avatar de ${comment.author.username}" class="post-avatar">
                <div class="post-body">
                    <div class="post-header">
                        <strong>${comment.author.username}</strong>
                        <span>@${comment.author.username} • ${commentDate}</span>
                    </div>
                    <p class="post-content">${comment.content}</p>
                </div>
            `;
            modalCommentsList.appendChild(commentEl);
        });
    }
}

    // Função para fechar o modal
    function closeCommentModal() {
        commentModalOverlay.classList.add('hidden');
        activePostId = null;
    }

    // Evento para abrir o modal ao clicar no post
    feedContainer.addEventListener('click', (e) => {
    const postElement = e.target.closest('.post');
    const commentButton = e.target.closest('.action-comment');

    // Se clicou no botão de comentário OU no corpo do post (mas não em outro botão de ação)
    if (postElement && (commentButton || !e.target.closest('.action'))) {
        const likeButton = postElement.querySelector('.action-like');
        if (likeButton) {
                openCommentModal(likeButton.dataset.postId);
            }
        }
    });
    
    // Eventos para fechar o modal
    closeCommentModalBtn.addEventListener('click', closeCommentModal);
    commentModalOverlay.addEventListener('click', (e) => {
        if (e.target === commentModalOverlay) closeCommentModal();
    });

    // Evento para submeter um novo comentário
    document.getElementById('comment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('comment-text').value;
        if (!content.trim() || !activePostId) return;

        await fetch(`${API_URL}/posts/${activePostId}/comments/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ content })
        });

        document.getElementById('comment-text').value = ''; // Limpa o campo
        openCommentModal(activePostId); // Recarrega os comentários
        loadFeed(); // Recarrega o feed para atualizar a contagem
    });

    // --- CARREGA TUDO EM ORDEM ---
    await loadCurrentUserData(); // Espera carregar os dados do usuário primeiro
    loadFeed();                  // Carrega o feed
    loadUsers();                 // Carrega a lista de "Quem Seguir"
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

    // --- FUNÇÃO QUE FALTAVA ---
    // Carrega as listas de seguidos e seguidores
    async function loadFollowLists() {
    const followingList = document.getElementById('following-list');
    const followersList = document.getElementById('followers-list');
    if (!followingList || !followersList) return;

    try {
        // Busca a lista de quem o usuário segue
        const followingResponse = await fetch(`${API_URL}/profile/following/`, { headers: { 'Authorization': `Bearer ${token}` } });
        const followingData = await followingResponse.json(); // followingData agora é a lista [...]
        followingList.innerHTML = '';
        
        // CORREÇÃO: Usamos a lista diretamente
        if (followingData.length > 0) {
            followingData.forEach(user => {
                const userElement = document.createElement('li');
                userElement.textContent = `@${user.username}`;
                followingList.appendChild(userElement);
            });
        } else {
            followingList.innerHTML = '<li>Você não segue ninguém ainda.</li>';
        }
        
        // Busca a lista de seguidores
        const followersResponse = await fetch(`${API_URL}/profile/followers/`, { headers: { 'Authorization': `Bearer ${token}` } });
        const followersData = await followersResponse.json(); // followersData agora é a lista [...]
        followersList.innerHTML = '';

        // CORREÇÃO: Usamos a lista diretamente
        if (followersData.length > 0) {
            followersData.forEach(user => {
                const userElement = document.createElement('li');
                userElement.textContent = `@${user.username}`;
                followersList.appendChild(userElement);
            });
        } else {
            followersList.innerHTML = '<li>Nenhum seguidor ainda.</li>';
        }
    } catch (error) {
        console.error("Erro ao carregar listas de seguidores:", error);
        followingList.innerHTML = '<li>Erro ao carregar.</li>';
        followersList.innerHTML = '<li>Erro ao carregar.</li>';
    }
}

     // ESTA É A FUNÇÃO CORRIGIDA PARA BUSCAR E EXIBIR OS DADOS
    async function loadProfileData() {
        try {
            const response = await fetch(`${API_URL}/profile/`, {
                headers: { 'Authorization': `Bearer ${token}` },
                // FORÇA O NAVEGADOR A BUSCAR NOVOS DADOS DA API, IGNORANDO O CACHE
                cache: 'no-cache'
            });
            const data = await response.json();

            document.getElementById('username').value = data.username;
            document.getElementById('bio').value = data.bio || '';
            
            if (data.profile_picture) {
                // FORÇA O NAVEGADOR A RECARREGAR A IMAGEM, IGNORANDO O CACHE
                profilePicPreview.src = `${data.profile_picture}?_=${new Date().getTime()}`;
            } else {
                profilePicPreview.src = 'static/icone.png';
            }
        } catch (error) {
            console.error("Erro ao carregar dados do perfil:", error);
            alert("Não foi possível carregar os dados do perfil.");
        }
    }

    // ESTE É O EVENTO CORRIGIDO PARA SALVAR AS ALTERAÇÕES
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('username', document.getElementById('username').value);
            formData.append('bio', document.getElementById('bio').value);

            const imageInput = document.getElementById('profile_picture');
            if (imageInput.files[0]) {
                formData.append('profile_picture', imageInput.files[0]);
            }

            const response = await fetch(`${API_URL}/profile/`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${value}`).join("\n");
                throw new Error(errorMessage);
            }

            alert("Perfil atualizado com sucesso!");
            
            // APÓS O SUCESSO, CHAMAMOS A FUNÇÃO QUE BUSCA OS DADOS FRESCOS DO SERVIDOR
            loadProfileData();

        } catch (error) {
            console.error('Falha ao atualizar o perfil:', error);
            alert(`Ocorreu um erro ao atualizar o perfil:\n${error.message}`);
        }
    });

    // O formulário de senha continua igual
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // ... (código do formulário de senha continua o mesmo)
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

    // Carga inicial dos dados - agora chamando as duas funções
    loadProfileData();
    loadFollowLists(); // <-- CHAMADA PARA A NOVA FUNÇÃO
}