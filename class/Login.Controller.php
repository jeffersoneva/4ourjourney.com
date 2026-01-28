<?php

    interface LoginController {

        // =====================================================
        // MÉTODOS PÚBLICOS
        // =====================================================

        public function verifyEmail(string $email): bool;
        public function registerUser(array $data): array;
        public function logUser(array $data): array;
        public function returnLogUser(int $id): bool;
        public function Security(): array;
        public function sessionDestroy(): bool;
        public function resetPassword(array $data): array;

        // =====================================================
        // MÉTODOS PÚBLICOS (INTERFACE)
        // =====================================================

        public function Email(): ?string;
        public function Name(): ?string;
        public function Photo(): ?string;
    }

?>
