# Swift Post (Projeto Final EBAC)

Bem-vindo ao Swift Post, um clone de rede social inspirado no Twitter e desenvolvido como projeto final para o curso da EBAC. A aplicação permite que usuários se cadastrem, personalizem seus perfis, postem mensagens, sigam outros usuários e interajam com um feed de notícias dinâmico.

## Deploy Online

Você pode acessar a versão ao vivo do projeto, hospedada no PythonAnywhere, através do seguinte link:

**[https://JoaoVBonifacio.pythonanywhere.com](https://JoaoVBonifacio.pythonanywhere.com)**

---

## Funcionalidades Implementadas

* **Sistema de Autenticação Completo:** Criação de conta e login seguro com tokens JWT.
* **Configuração de Perfil de Usuário:**
    * Visualização e edição de nome de usuário, bio e foto de perfil.
    * Alteração de senha de forma segura.
    * Visualização das listas de "Seguindo" e "Seguidores".
* **Sistema Social e Feed de Notícias:**
    * Funcionalidade de seguir e deixar de seguir outros usuários.
    * Feed de notícias que exibe apenas as postagens dos usuários seguidos.
* **Interações nas Postagens:**
    * Criação de novas postagens.
    * Sistema de "Curtir" e "Descurtir" posts.
    * Sistema de Comentários em um modal.

## Tecnologias Utilizadas

* **Backend:**
    * Python 3.11
    * Django & Django REST Framework
    * Simple JWT (para autenticação)
* **Frontend:**
    * HTML5, CSS3, JavaScript (Vanilla JS)
* **Banco de Dados:**
    * **Desenvolvimento:** SQLite 3
    * **Produção:** MySQL (via PythonAnywhere)
* **Deploy:**
    * PythonAnywhere

## Como Executar Localmente

Siga os passos abaixo para rodar o projeto na sua máquina.

‼️-- **Ao acessar o projeto na máquina, lembra de colocar DEBUG = True no settings.py no caminho :**
 ```bash
    ebac_final_project/backend/settings.py
 ```

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git](https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git)
    cd nome-da-pasta-do-projeto
    ```
    *(Substitua com a URL do seu repositório)*

2.  **Crie e ative o ambiente virtual:**
    ```bash
    # Crie o ambiente (requer Python 3.11+)
    python -m venv venv

    # Ative o ambiente no Windows
    venv\Scripts\activate

    # Ative o ambiente no macOS/Linux
    source venv/bin/activate
    ```

3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Crie o banco de dados local:**
    ```bash
    python manage.py migrate
    ```

5.  **Inicie o servidor do Backend:**
    (Em um terminal)
    ```bash
    python manage.py runserver
    ```
    O backend estará rodando em `http://127.0.0.1:8000`.

6.  **Inicie o servidor do Frontend:**
    * Recomenda-se usar a extensão **"Live Server"** do Visual Studio Code.
    * Clique com o botão direito no arquivo `frontend/index.html` e selecione "Open with Live Server".
    * O frontend estará acessível em `http://127.0.0.İ:5500`.
6.  Rodar o comando `python manage.py migrate` no console do PythonAnywhere para criar as tabelas no banco de dados de produção.

---
