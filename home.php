<?php

   /*  require_once ("./config/Session.Config.php");
    require_once ("../conn/Conn.Class.php");
    $conn = new Conn("4ourjourney");

    require_once ("./class/Users.Class.php");
    $users = new Users($conn->Connect()); */

    $v = rand(0, 9999);

?>
<!DOCTYPE html>
<html lang="pt-BR">

	<head>

        <meta charset="UTF-8">

        <meta name="referrer" content="strict-origin-when-cross-origin">
        <meta http-equiv="Content-Language" content="pt-BR">

		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

		<meta name="theme-color" content="#FFFFFF">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

        <meta name="description" content="4ourjourney é uma rede social para casais compartilharem sua jornada a dois. Conecte-se com outros casais, siga histórias reais, publique momentos especiais e fortaleça relacionamentos.">
        <meta name="author" content="4ourjourney">
        <meta name="keywords" content="4ourjourney, rede social para casais, relacionamento, vida a dois, casal, feed de casais, comunidade de casais, histórias de amor, journey together">
        <meta name="robots" content="index, follow">
        <link rel="canonical" href="https://www.4ourjourney.com">

        <meta property="og:title" content="4ourjourney • A rede social da jornada a dois">
        <meta property="og:description" content="4ourjourney é uma rede social para casais compartilharem sua jornada a dois. Conecte-se com outros casais, siga histórias reais, publique momentos especiais e fortaleça relacionamentos.">
        <meta property="og:url" content="https://www.4ourjourney.com">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="4ourjourney">
        <meta property="og:image" content="https://www.4ourjourney.com/assets/img/meta-image.jpg">

        <meta name="twitter:title" content="4ourjourney • A rede social da jornada a dois">
        <meta name="twitter:description" content="4ourjourney é uma rede social para casais compartilharem sua jornada a dois. Conecte-se com outros casais, siga histórias reais, publique momentos especiais e fortaleça relacionamentos.">
        <meta name="twitter:image" content="https://www.4ourjourney.com/assets/img/meta-image.jpg">
        <meta name="twitter:card" content="summary_large_image">

        <link rel="stylesheet" href="./assets/css/default.css">
        <link rel="stylesheet" href="./assets/css/style.css?version=<?= $v; ?>">

        <script defer src="./assets/js/jquery.js" type="text/javascript"></script>
        <script defer src="./assets/js/default.js" type="text/javascript"></script>
        <script defer src="./assets/js/functions.js?version=<?= $v; ?>" type="text/javascript"></script>
        <script defer src="./assets/js/langs.js" type="text/javascript"></script>
        <script defer src="./assets/js/SmoothScroll.js" type="text/javascript"></script>

        <link rel="icon" href="./assets/img/favicons/favicon-16.png" sizes="16x16" type="image/png">
        <link rel="icon" href="./assets/img/favicons/favicon-32.png" sizes="32x32" type="image/png">
        <link rel="icon" href="./assets/img/favicons/favicon-48.png" sizes="48x48" type="image/png">
        <link rel="icon" href="./assets/img/favicons/favicon-64.png" sizes="64x64" type="image/png">

        <link rel="apple-touch-icon" href="./assets/img/favicons/favicon-120.png" sizes="120x120">
        <link rel="apple-touch-icon" href="./assets/img/favicons/favicon-152.png" sizes="152x152">
        <link rel="apple-touch-icon" href="./assets/img/favicons/favicon-167.png" sizes="167x167">
        <link rel="apple-touch-icon" href="./assets/img/favicons/favicon-180.png" sizes="180x180">

        <link rel="icon" href="./assets/img/favicons/favicon-192.png" sizes="192x192" type="image/png">
        <link rel="icon" href="./assets/img/favicons/favicon-512.png" sizes="512x512" type="image/png">

		<title>4ourjourney</title>

    </head>

    <body>

        <div class="loading flex-center-center">
            <div class="loader-sup">
                <img src="./assets/img/logo-loading.svg" alt="Loading" />
            </div>
            <div class="loader-sub txt-minuscule">
                4ourjourney.com - copyright <?= date('Y'); ?><sup>©</sup>
            </div>
        </div>

        <div class="popup-wallpaper"></div>
        <div class="popup">
            <div class="popup-header flex-center-between">
                <div class="popup-header-count">-</div>
                <div class="popup-btn-close flex-center-center">&#10005;</div>
            </div>
            <div class="popup-count"></div>
        </div>

        <div class="content-cookie flex-center-center">
            <div class="container-small flex-center-center">
                <div class="cookie-text flex-center-center" id="warning-cookie">Não utilizamos cookies para armazenar ou coletar suas informações pessoais.</div>
                <div class="cookie-btn flex-center-center">
                    <a id="click-btn-cookie" class="flex-center-center">OK</a>
                </div>
            </div>
        </div>

        <div class="alter-language">
            <div class="language-switch">
                <span class="lang-label">PT</span>
                <input type="checkbox" id="lang-toggle">
                <label for="lang-toggle" class="switch"></label>
                <span class="lang-label">EN</span>
            </div>
        </div>

        <div class="container-login flex-center-center">

            <div class="auth-section flex-center-between">
                <div class="auth-left">
                    <img src="./assets/img/logo-loading.svg" alt="Imagem de boas-vindas">
                    <div class="home-cont">
                        <h1 id="home-h1">4ourjourney is a community for couples who have decided to invest in their relationship every day.</h1>
                        <p id="home-p-1" class="txt-small">Here, you can share real experiences, exchange ideas, learn from other couples, and grow together—in body, mind, and life.</p>
                        <p id="home-p-2" class="txt-small">In “Daily”, our administrators publish daily content with readings, music, nutrition, training, reflections, and biblical passages, designed to strengthen the couple's routine, connection, and purpose.</p>
                        <p id="home-p-3" class="txt-small">If you believe that relationships are built with consistency, presence, and intention, this is the place to walk together.</p>
                        <p id="home-cta">👉 Create your account and join our community.</p>
                    </div>
                </div>

                <div class="auth-right flex-center-center">
                    <form class="login-form flex-center-center">
                        <h2>LOGIN</h2>

                        <input type="email" placeholder="Seu email" maxlength="50" id="form-login-email" required>
                        <input type="password" placeholder="Sua senha" maxlength="50" id="form-login-senha" required>

                        <button type="submit"><span id="form-login-submit">Entrar</button>

                        <span class="register-link" id="form-login-register">Não tem conta? <a href='#'>Cadastre-se</a></span>
                    </form>
                </div>
            </div>

        </div>

        <div class="footer-links">
            <div class="container-small">
                <nav class="footer-links flex-center-center txt-small">
                    <a href="#" id="footer-privacy-link">
                        <span id="footer-politica-de-privacidade">Política de Privacidade</span>
                    </a>
                    <span class="footer-separator">•</span>
                    <a href="#" id="footer-terms-link">
                        <span id="footer-termos-de-uso">Termos de Uso</span>
                    </a>
                </nav>
            </div>
        </div>

        <div class="footer">
            <div class="container-small flex-center-center">
                <p class="txt-minuscule">4ourjourney.com - copyright <?= date('Y'); ?><sup>©</sup></p>
            </div>
        </div>
        
    </body>
</html>