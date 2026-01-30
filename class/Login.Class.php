<?php

    require_once ("Utils.Trait.php");
    require_once ("Login.Controller.php");

    class Login implements LoginController {

        // --- Utilidades públicas das classes ---
        use UtilsTrait;

        // =====================================================
        // ATRUBUTOS PRIVADOS
        // =====================================================

        // --- colunas da tabela tb_login ---
        private ?int     $id = null;            // Id da tabela de login
        private ?string  $email = null;         // Email de login
        private ?string  $pass  = null;         // Senha de acesso
        private ?string  $sessionToken = null;  // Token da sessão
        private ?string  $lastActivity = null;  //
        private ?int     $attempts = null;      // Tentativas de senhas (default 5)
        private ?int     $situation = null;     // 0 Normal ; 1 Block
        private ?int     $fk_user  = null;      // Id da tabela de usuario (tb_users)
        private ?string  $sessionId = null;     // Id da sessão atual

        // --- ATRIBUTOS DE CONEXÃO ---
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
            return (bool) $this->fetchOne("SELECT id FROM tb_login WHERE email = ? LIMIT 1",[$email]);
        }

        // --- Efetua login do usuário ---
        public function logUser(array $data): array {

            $this->setEmail(trim($data['email'] ?? ''));
            $this->setPass($data['pass'] ?? '');

            if ($this->getEmail() === '' || $this->getPass() === '') {
                return $this->responseSpan('Fail','dados-incompletos','Dados incompletos.');
            }

            $user = $this->fetchOne("SELECT id, fk_user, pass, attempts, situation FROM tb_login WHERE email = ? LIMIT 1", [$this->getEmail()]);

            if (!$user) { return $this->responseSpan('Fail','usuario-nao-encontrado','Usuário não encontrado.'); }

            $this->setId($user['id']);
            $this->setFkUser($user['fk_user']);
            $this->setAttempts($user['attempts']);
            $this->setSituation($user['situation']);

            if ($this->getSituation() !== 0 || $this->getAttempts() <= 0) {
                return $this->responseSpan('Fail','usuario-bloqueado','Usuário bloqueado.');
            }

            if (!password_verify($this->getPass(), $user['pass'])) {
                $this->setAttempts($this->getAttempts() - 1);
                $this->executeQuery("UPDATE tb_login SET attempts = ? WHERE email = ?",[$this->getAttempts(), $this->getEmail()]);
                return $this->responseSpan('Fail','senha-incorreta','Senha incorreta.<br><a id="redefinir-senha">Clique aqui</a>');
            }

            // LOGIN OK
            session_regenerate_id(true);

            $this->setSessionToken(bin2hex(random_bytes(32)));
            $this->setSessionId(session_id());
            $this->setLastActivity(date('Y-m-d H:i:s'));

            $this->executeQuery("UPDATE tb_login SET attempts = 5, session_token = ?, session_id = ?, last_activity = ? WHERE id = ?",[$this->getSessionToken(),$this->getSessionId(),$this->getLastActivity(),$this->getId()]);

            $_SESSION['UserID']       = $this->getFkUser();
            $_SESSION['UserEmail']    = $this->getEmail();
            $_SESSION['SessionToken'] = $this->getSessionToken();
            $_SESSION['UAHash']       = hash('sha256', $_SERVER['HTTP_USER_AGENT'] ?? '');
            $_SESSION['IPHash']       = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '');

            $this->notifyLogin($this->getEmail());

            return ['status' => 'Success'];

        }

        // --- Verifica se o usuário já está logado ---
        public function redirectIfAuthenticated(): void {

            if (empty($_SESSION['UserID']) || empty($_SESSION['SessionToken'])) {
                return;
            }

            $this->setSessionToken($_SESSION['SessionToken']);
            $this->setEmail($_SESSION['UserEmail']);

            $row = $this->fetchOne("SELECT id, session_id FROM tb_login WHERE email = ? AND session_token = ? AND situation = 0 LIMIT 1", [$this->getEmail(), $this->getSessionToken()]);

            if (!$row) return;

            $this->setId($row['id']);
            $this->setSessionId($row['session_id']);

            if (!hash_equals($this->getSessionId(), session_id())) return;

            $this->executeQuery(
                "UPDATE tb_login SET last_activity = NOW() WHERE id = ?",
                [$this->getId()]
            );

            header("Location: /feed.php");
            exit;
        }

        // --- Destrói a sessão atual ---
        public function sessionDestroy(): bool {

            if (session_status() !== PHP_SESSION_ACTIVE) {
                return true;
            }

            if (!empty($_SESSION['SessionToken'])) {
                $this->executeQuery("UPDATE tb_login SET session_token = NULL, session_id = NULL WHERE session_token = ?",[$_SESSION['SessionToken']]);
            }

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

        // --- Função de segurança que mantém o usuário logado ---
        public function Security(): void {

            if (
                empty($_SESSION['UserID']) ||
                empty($_SESSION['UserEmail']) ||
                empty($_SESSION['SessionToken']) ||
                empty($_SESSION['UAHash']) ||
                empty($_SESSION['IPHash'])
            ) {
                $this->sessionDestroy();
                header("Location: ./auth/");
                exit;
            }

            // User-Agent
            if (!hash_equals(
                $_SESSION['UAHash'],
                hash('sha256', $_SERVER['HTTP_USER_AGENT'] ?? '')
            )) {
                $this->sessionDestroy();
                header("Location: ./auth/");
                exit;
            }

            // IP
            if (!hash_equals(
                $_SESSION['IPHash'],
                hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '')
            )) {
                $this->sessionDestroy();
                header("Location: ./auth/");
                exit;
            }

            $user = $this->fetchOne(
                "SELECT id, fk_user, situation, last_activity, session_id
                FROM tb_login
                WHERE email = ? AND session_token = ?
                LIMIT 1",
                [$_SESSION['UserEmail'], $_SESSION['SessionToken']]
            );

            // 🔐 Proteção contra session fixation
            if (
                !$user ||
                empty($user['session_id']) ||
                !hash_equals($user['session_id'], session_id())
            ) {
                $this->sessionDestroy();
                header("Location: ./auth/");
                exit;
            }

            if ((int)$user['situation'] !== 0) {
                $this->sessionDestroy();
                header("Location: ./auth/");
                exit;
            }

            $timeout = 60 * 30;
            if ($user['last_activity']) {
                if ((time() - strtotime($user['last_activity'])) > $timeout) {
                    $this->sessionDestroy();
                    header("Location: ./auth/");
                    exit;
                }
            }

            $this->executeQuery(
                "UPDATE tb_login SET last_activity = NOW() WHERE id = ?",
                [$user['id']]
            );

            $this->setId($user['id']);
            $this->setFkUser($user['fk_user']);
            $this->setEmail($_SESSION['UserEmail']);
        }

        // =====================================================
        // MÉTODOS PÚBLICOS (INTERFACE)
        // =====================================================

        public function Id(): ?int              { return $this->getId(); }
        public function Email(): ?string        { return $this->getEmail(); }
        public function Pass(): ?string         { return $this->getPass(); }
        public function SessionToken(): ?string { return $this->getSessionToken(); }
        public function LastActivity(): ?string { return $this->getLastActivity(); }
        public function Attempts(): ?int        { return $this->getAttempts(); }
        public function Situation(): ?int       { return $this->getSituation(); }
        public function FkUser(): ?int          { return $this->getFkUser(); }
        public function SessionId(): ?string    { return $this->getSessionId(); }

        // =====================================================
        // GETTERS E SETTERS PRIVADOS
        // =====================================================

        private function getId(): ?int { return $this->id; }
        private function getEmail(): ?string { return $this->email; }
        private function getPass(): ?string { return $this->pass; }
        private function getSessionToken(): ?string { return $this->sessionToken; }
        private function getLastActivity(): ?string { return $this->lastActivity; }
        private function getAttempts(): ?int { return $this->attempts; }
        private function getSituation(): ?int { return $this->situation; }
        private function getFkUser(): ?int { return $this->fk_user; }
        private function getSessionId(): ?string { return $this->sessionId; }

        private function setId(?int $id): void { $this->id = $id; }
        private function setEmail(?string $email): void { $this->email = $email; }
        private function setPass(?string $pass): void { $this->pass = $pass; }
        private function setSessionToken(?string $sessionToken): void { $this->sessionToken = $sessionToken; }
        private function setLastActivity(?string $lastActivity): void { $this->lastActivity = $lastActivity; }
        private function setAttempts(?int $attempts): void { $this->attempts = $attempts; }
        private function setSituation(?int $situation): void { $this->situation = $situation; }
        private function setFkUser(?int $fk_user): void { $this->fk_user = $fk_user; }
        private function setSessionId(?string $sessionId): void { $this->sessionId = $sessionId; }

    }

?>