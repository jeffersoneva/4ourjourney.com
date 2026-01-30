<?php

    require_once ("../config/Session.Config.php");
    require_once ("../../conn/Conn.Class.php");
    $conn = new Conn("4ourjourney");

    require_once ("../class/Login.Class.php");
    $login = new Login($conn->Connect());

    // 🔐 Se já estiver logado → feed
    $login->redirectIfAuthenticated();

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

        <link rel="stylesheet" href="../assets/css/default.css">
        <link rel="stylesheet" href="../assets/css/style.css?version=<?= $v; ?>">

        <script defer src="../assets/js/jquery.js" type="text/javascript"></script>
        <script defer src="../assets/js/default.js" type="text/javascript"></script>
        <script defer src="../assets/js/langs.js" type="text/javascript"></script>
        <script defer src="../assets/js/functions.js?version=<?= $v; ?>" type="text/javascript"></script>
        <script defer src="../assets/js/SmoothScroll.js" type="text/javascript"></script>

        <link rel="icon" href="../assets/img/favicons/favicon-16.png" sizes="16x16" type="image/png">
        <link rel="icon" href="../assets/img/favicons/favicon-32.png" sizes="32x32" type="image/png">
        <link rel="icon" href="../assets/img/favicons/favicon-48.png" sizes="48x48" type="image/png">
        <link rel="icon" href="../assets/img/favicons/favicon-64.png" sizes="64x64" type="image/png">

        <link rel="apple-touch-icon" href="../assets/img/favicons/favicon-120.png" sizes="120x120">
        <link rel="apple-touch-icon" href="../assets/img/favicons/favicon-152.png" sizes="152x152">
        <link rel="apple-touch-icon" href="../assets/img/favicons/favicon-167.png" sizes="167x167">
        <link rel="apple-touch-icon" href="../assets/img/favicons/favicon-180.png" sizes="180x180">

        <link rel="icon" href="../assets/img/favicons/favicon-192.png" sizes="192x192" type="image/png">
        <link rel="icon" href="../assets/img/favicons/favicon-512.png" sizes="512x512" type="image/png">

		<title>4ourjourney</title>

    </head>

    <body>

        <div class="loading flex-center-center">
            <div class="loader-sup">
                <img src="../assets/img/logo-loading.svg" alt="Loading" />
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

        <div class="container-login flex-center-center">

            <div class="auth-section flex-center-between">
                <div class="auth-left">
                    <div class="flex-center-center">
                        <img src="../assets/img/logo-loading.svg" alt="Imagem de boas-vindas">
                    </div>
                    <div class="home-cont txt-center">
                        <h1 id="home-h1">4ourjourney é uma comunidade para casais que decidiram investir em seu relacionamento todos os dias.</h1>
                        <p id="home-p-1" class="txt-small">Aqui, você pode compartilhar experiências reais, trocar ideias, aprender com outros casais e crescer juntos — em corpo, mente e vida.</p>
                        <p id="home-p-2" class="txt-small">No “Daily”, nossos administradores publicam conteúdos diários com leituras, músicas, nutrição, treinos, reflexões e passagens bíblicas, pensados para fortalecer a rotina, a conexão e o propósito do casal.</p>
                        <p id="home-p-3" class="txt-small">Se você acredita que relacionamentos são construídos com constância, presença e intenção, este é o lugar para caminhar juntos.</p>
                        <p id="home-cta" class="txt-small">👉 Crie sua conta e faça parte da nossa comunidade.</p>
                    </div>
                </div>
                <div class="auth-right flex-center-center">
                    <img src="../assets/img/loading.gif" width="64" alt="Loaging form" />
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
                    <span class="footer-separator">•</span>
                    <label for="lang-select" id="alter-language">Idioma</label>
                    <select class="alter-language" id="lang-select">
                        <option value="en">English</option>
                        <option value="pt">Português</option>
                    </select>
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