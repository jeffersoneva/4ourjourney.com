<?php

    require_once ("Utils.Trait.php");
    require_once ("Login.Controller.php");

    class Login implements LoginController {

        use UtilsTrait;

        // =====================================================
        // PROPRIEDADES PRIVADAS
        // =====================================================

        private ?string $email = null;
        private ?string $name  = null;
        private ?string $photo = null;

        private PDO $pdo;

        // =====================================================
        // CONSTRUTOR
        // =====================================================

        public function __construct(PDO $pdo){
            $this->pdo = $pdo;
        }

        // =====================================================
        // MÉTODOS PÚBLICOS
        // =====================================================

        // --- Verifica se usuário existe pelo email ---
        public function verifyEmail(string $email): bool {
            $row = $this->fetchOne("SELECT id FROM tb_users WHERE email = ? LIMIT 1", [$email]);
            return (bool) $row;
        }

        // --- Registra um novo usuário ---
        public function registerUser(array $data): array {
            $email = trim($data['email'] ?? '');
            $pass  = $data['pass'] ?? '';
            $first = $data['first-name'] ?? '';
            $last  = $data['last-name'] ?? '';
            $fullname = trim("$first $last");

            if ($email === '' || $pass === '' || $fullname === '') { return $this->responseSpan('Fail', 'dados-incompletos', 'Dados incompletos.'); }

            if ($this->verifyEmail($email)) { return $this->responseSpan('Fail', 'email-ja-cadastrado', 'Email já cadastrado em nosso sistema.'); }

            $hashed = password_hash($pass, PASSWORD_ARGON2ID);
            $inserted = $this->executeQuery("INSERT INTO tb_users (name, email, pass, created_in) VALUES (?, ?, ?, NOW())",[$fullname, $email, $hashed]);

            if (!$inserted) { return $this->responseSpan('Fail', 'falha-cadastrar-usuario', 'Falha ao adicionar dados de usuário.'); }

            $this->setEmail($email);
            $this->setName($fullname);
            $this->setPhoto('default.avif');

            $_SESSION['UserID'] = (int)$this->pdo->lastInsertId();
            $_SESSION['UserEmail'] = $email;

            $this->notifyRegister($this->getEmail(), $this->getName());

            return [
                'status' => 'Success',
                'username' => $fullname,
                'useremail' => $email,
                'userphoto' => 'default.avif'
            ];
        }

        // --- Efetua login do usuário ---
        public function logUser(array $data): array {
            $email = trim($data['email'] ?? '');
            $pass  = $data['pass'] ?? '';

            if ($email === '' || $pass === '') { return $this->responseSpan('Fail', 'dados-incompletos', 'Dados incompletos.'); }

            $user = $this->fetchOne("SELECT id, name, email, pass, photo FROM tb_users WHERE email = ? LIMIT 1",[$email]);

            if(!$user){ return $this->responseSpan('Fail', 'usuario-nao-encontrado', 'Usuário não encontrado.'); }

            if (!password_verify($pass, $user['pass'])) {
                return $this->responseSpan(
                    'Fail',
                    'senha-incorreta',
                    'Senha incorreta.<br /> Para redefinir sua senha, <a id="redefinir-senha">clique aqui</a>.'
                );
            }

            $this->setEmail($user['email']);
            $this->setName($user['name']);
            $this->setPhoto($user['photo'] ?: 'default.avif');

            $_SESSION['UserID'] = (int)$user['id'];
            $_SESSION['UserEmail'] = $this->getEmail();

            $this->notifyLogin($this->getEmail(), $this->getName());

            return [
                'status' => 'Success',
                'username' => $user['name'],
                'useremail' => $user['email'],
                'userphoto' => $user['photo'] ?: 'default.avif'
            ];
        }

        // --- Seta dados do usuário pelo seu ID ---
        public function returnLogUser(int $id): bool {
            $user = $this->fetchOne("SELECT id, name, email, photo FROM tb_users WHERE id = ? LIMIT 1",[$id]);
            if(!$user){ return false; }
            $this->setName($user["name"]);
            $this->setEmail($user["email"]);
            $this->setPhoto($user["photo"] ?: "default.avif");
            return true;
        }

        // --- Redefine a senha do usuário ---
        public function resetPassword(array $data): array {

            $email = trim($data['email'] ?? '');

            if ($email === '') { return $this->responseSpan('Fail', 'dados-incompletos', 'Dados incompletos.'); }

            $neutral = $this->responseSpan(
                'Fail',
                'reset-password-message',
                'Caso este e-mail exista na base de dados, você receberá uma senha temporária.'
            );

            $user = $this->fetchOne("SELECT name FROM tb_users WHERE email = ? LIMIT 1",[$email]);

            if (!$user) { return $neutral; }

            $this->setName($user['name']);

            $newPass = $this->newPass();
            $hash = password_hash($newPass, PASSWORD_ARGON2ID);

            $updated = $this->updateUserPassword($email, $hash);

            if (!$updated) {
                return $this->responseSpan(
                    'Fail',
                    'reset-password-fail-db',
                    'Falha ao alterar senha na base de dados.'
                );
            }

            if (!$this->notifyAlterPassword($email, $this->getName(), $newPass)) {
                return $this->responseSpan(
                    'Fail',
                    'reset-password-problems',
                    'Ops, problema ao enviar email de redefinição de senha. Tente novamente mais tarde.'
                );
            }

            return $neutral;
        }

        // --- Gera um hash de nova senha ---
        private function newPass(int $length = 8): string {
            return substr(bin2hex(random_bytes(16)), 0, $length);
        }

        // --- Altera senha na base de dados ---
        private function updateUserPassword(string $email, string $hash): bool {
            return $this->executeQuery(
                "UPDATE tb_users SET pass = ?, temp_pass = 1, attempts = 5 WHERE email = ?",
                [$hash, $email]
            );
        }

        // --- Destrói a sessão atual
        public function sessionDestroy(): bool {
            $_SESSION = [];

            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(
                    session_name(),
                    '',
                    time() - 42000,
                    $params["path"],
                    $params["domain"],
                    $params["secure"],
                    $params["httponly"]
                );
            }

            session_destroy();
            return true;
        }

        // --- Função de segurança que mantém o usuário logado
        public function Security(): array {

           if (!isset($_SESSION['UserID'], $_SESSION['UserEmail'])) {
                return [
                    'status'  => 'Success',
                    'message' => 'Offline'
                ];
            }

            $user = $this->fetchOne("SELECT id, name, email, photo FROM tb_users WHERE id = ? AND situation = 'Active'",[(int)$_SESSION['UserID']]);

            if (!$user) {
                $this->sessionDestroy();
                return ['status' => 'Error', 'message' => 'Usuário não encontrado.'];
            }

            return [
                'status'    => 'Success',
                'message'   => 'Online',
                'username'  => $user['name'],
                'useremail' => $user['email'],
                'userphoto' => $user['photo'] ?: 'default.avif'
            ];
        }

        // =====================================================
        // MÉTODOS PÚBLICOS (INTERFACE)
        // =====================================================

        public function Email(): ?string { return $this->getEmail(); }
        public function Name(): ?string  { return $this->getName(); }
        public function Photo(): ?string { return $this->getPhoto(); }

        // =====================================================
        // GETTERS E SETTERS PRIVADOS
        // =====================================================

        private function getEmail(): ?string { return $this->email; }
        private function getName(): ?string  { return $this->name; }
        private function getPhoto(): ?string { return $this->photo; }

        private function setEmail(?string $email): void { $this->email = $email; }
        private function setName(?string $name): void   { $this->name = $name; }
        private function setPhoto(?string $photo): void { $this->photo = $photo; }

    }

?>