<?php

    trait UtilsTrait {

        // =====================================================
        // FUNÇÕES UTILITÁRIAS
        // =====================================================

        // --- Função de retornos de elementos dinâmicos com IDs para tradução ---
        private function responseSpan(string $status, string $id, string $text): array {
            return [
                'status' => $status,
                'message' => '<span id="'.$id.'">'.$text.'</span>'
            ];
        }

        // --- Retorna uma única linha da base de dados ---
        private function fetchOne(string $sql, array $params = []): ?array {
            try {
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute($params);
                return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
            } catch (Exception $e) {
                return null;
            }
        }

        // --- Retorna um array da base de dados ---
        private function fetchAll(string $sql, array $params = []): array {
            try {
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute($params);
                return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            } catch (Exception $e) {
                return [];
            }
        }

        // --- Executa queries como Updates, Insert, etc... ---
        private function executeQuery(string $sql, array $params = []): bool {
            try {
                $stmt = $this->pdo->prepare($sql);
                return $stmt->execute($params);
            } catch (Exception $e) {
                return false;
            }
        }

        private function returnDateExtense(?string $data = null): string{
            $meses = [
                1  => 'Janeiro',
                2  => 'Fevereiro',
                3  => 'Março',
                4  => 'Abril',
                5  => 'Maio',
                6  => 'Junho',
                7  => 'Julho',
                8  => 'Agosto',
                9  => 'Setembro',
                10 => 'Outubro',
                11 => 'Novembro',
                12 => 'Dezembro'
            ];

            // Se não receber data, usa a data/hora atual
            $timestamp = $data
                ? (is_numeric($data) ? $data : strtotime($data))
                : time();

            $dia  = date('d', $timestamp);
            $mes  = $meses[(int) date('n', $timestamp)];
            $ano  = date('Y', $timestamp);
            $hora = date('H', $timestamp);
            $min  = date('i', $timestamp);

            return "{$dia} de {$mes} de {$ano} às {$hora}h{$min}";
        }

        // =====================================================
        // ENVIO DE EMAIL
        // =====================================================

        // --- Envia um email de notificação ---
        private function sendEmail(string $content, string $email, string $name, string $page): bool{

            $content = $content ?: "Email enviado sem um conteúdo presente.";
            $email   = filter_var($email, FILTER_VALIDATE_EMAIL) ?: 'contato@jeffersoneva.com';
            $name    = htmlspecialchars($name ?: "Contato", ENT_QUOTES, 'UTF-8');
            $date    = $this->returnDateExtense();

            $allowedTemplates = [
                'user-register.php',
                'user-login.php',
                'user-book-approved.php',
                'user-reset-password.php'
            ];
            $page = in_array($page, $allowedTemplates, true) ? $page : 'default.php';

            $subjectMap = [
                'user-register.php'       => 'Novo cadastro',
                'user-login.php'          => 'Novo acesso à sua conta',
                'user-book-approved.php'  => 'Compra confirmada',
                'user-reset-password.php' => 'Redefinição de senha',
                'default.php'             => 'Notificação'
            ];

            $subject = $subjectMap[$page] ?? 'Notificação';

            require_once __DIR__ . '/../vendor/autoload.php';

            try {

                $mail = new \PHPMailer\PHPMailer\PHPMailer(true);

                $mail->isSMTP();
                $mail->Host       = 'smtp.titan.email';
                $mail->SMTPAuth   = true;
                $mail->Username   = 'contato@jeffersoneva.com';
                $mail->Password   = 'C@tit928!EvaJLS15';
                $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
                $mail->Port       = 465;
                $mail->CharSet = 'UTF-8';
                $mail->Timeout = 10;

                $mail->setFrom('contato@jeffersoneva.com', 'Jefferson Eva');
                $mail->addAddress($email, $name);
                $mail->addBCC('mail@jeffersoneva.com', 'Jefferson Eva');

                $mail->isHTML(true);
                $mail->AltBody = strip_tags($content);
                $mail->Subject = $subject;

                ob_start();
                require __DIR__ . '/../templates/email/'.$page;
                $mail->Body = ob_get_clean();

                $mail->send();
                return true;

            } catch (\Throwable $e) {
                $this->logMail('ERROR',"Falha envio | {$email} | {$e->getMessage()}");
                return false;
            }
        }

        // =====================================================
        // PADRÕES DE MENSAGENS DE EMAIL
        // =====================================================

        // --- NOTIFICAÇÃO DE CADASTRO ---
        private function notifyRegister(string $email, string $nome): void {
            /* $sent = $this->sendEmail('Parabéns <b>'.$nome.'</b>, seu cadastro foi efetuado com sucesso!',$email,$nome,'user-register.php');
            $this->logMail($sent ? 'SUCCESS' : 'ERROR',"Cadastro | {$email}"); */
        }

        // --- NOTIFICAÇÃO DE LOGIN ---
        private function notifyLogin(string $email): void {
            /* $sent = $this->sendEmail('Você acabou de fazer login no site Web Site de Jefferson Eva. Avise-nos se não foi você.',$email,$nome,'user-login.php');
            $this->logMail($sent ? 'SUCCESS' : 'ERROR',"Login | {$email}"); */
        }

        // --- NOTIFICAÇÃO DE COMPRA DE LIVRO ---
        private function notifyBookApproved(string $email, int $bookId): void {
            /* $sent = $this->sendEmail('Seu pagamento foi aprovado e você já pode aproveitar o conteúdo adquirido!',$email,'','user-book-approved.php');
            $this->logMail($sent ? 'SUCCESS' : 'ERROR',"Aquisição de Livro ({$bookId}) | {$email}"); */
        }

        // --- NOTIFICAÇÃO DE ALTERAÇÃO DE SENHA ---
        private function notifyAlterPassword(string $email, string $nome, string $newPass): bool {
           /*  $sent = $this->sendEmail('Sua senha foi alterada com sucesso.<br /> Esta é a sua nova senha temporária:<br /> <b style="font-size:20pt;">'.$newPass.'</b>',$email,'','user-reset-password.php');
            $this->logMail($sent ? 'SUCCESS' : 'ERROR',"Redefinição de senha | {$email}");
            return $sent; */
        }

        // =====================================================
        // PADRÕES DE MENSAGENS DE EMAIL
        // =====================================================

        private function logMail(string $status, string $message): void {
            $file = __DIR__ . '/../logs/mail.log';
            $status = strtoupper($status) === 'SUCCESS' ? 'SUCCESS' : 'ERROR';
            file_put_contents($file,date('Y-m-d H:i:s') . " | {$status} | {$message}\n",FILE_APPEND);
        }

    }
