<?php

    interface LoginController {

        // =====================================================
        // MÉTODOS PÚBLICOS
        // =====================================================

        public function verifyEmail(string $email): bool;
        public function logUser(array $data): array;
        public function redirectIfAuthenticated(): void;
        public function sessionDestroy(): bool;
        public function Security(): void;

        // =====================================================
        // MÉTODOS PÚBLICOS (INTERFACE)
        // =====================================================

        public function Id(): ?int;
        public function Email(): ?string;
        public function Pass(): ?string;
        public function Attempts(): ?int;
        public function Situation(): ?int;
        public function FkUser(): ?int;
    }

?>
