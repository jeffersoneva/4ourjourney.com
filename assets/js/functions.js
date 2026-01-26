// ======================================================================
// Bloco 0: CONFIGURAÇÕES GLOBAIS
// ======================================================================

// -- Mapeamento do diretorio atual
const dirs = ["ebook", "ebooks"];
const mustGoBack = dirs.some(dir => window.location.pathname.includes(`/${dir}/`));
const basePath = mustGoBack ? "../" : "./";

// --- Controle de login do usuário ---
let inLog = false;

// --- Controle do intervalo de verificação de login ---
let verifyLogInterval = null;
const VERIFY_LOG_DELAY = 3000;

 // --- Controle de 'recém login' ao clicar no botão de compra ---
let clickLog = false;

// --- ID do livro da Compra em progresso
let pendingBookId = null;

// --- Cupom de desconto ---
let discountPercentage = null;

// --- Controle de pagamento efeuado por PIX ---
let payPix = false
let pixInterval = null;

// --- Funções implementares da função global POPUP ---

// --- Reseta dados de compra ---
function resetBuyFlow() {
    clickLog = false;
    pendingBookId = null;
}

// --- Reseta dados de pagamento via Pix ---
function stopPixVerification(){
    if (pixInterval) {
        clearInterval(pixInterval);
        pixInterval = null;
        payPix = false;
    }
}

// --- Aplica casos específicos ao fechamento de PopUp ---

$(document).on("click", ".popup-wallpaper, .popup-btn-close", function () {
    resetBuyFlow();
    stopPixVerification();
});

$(document).on("keydown", function (e) {
    if (e.key === "Escape") {
        resetBuyFlow();
        stopPixVerification();
    }
});

$(document).on("click", ".btn-login-header", function () {
    resetBuyFlow();
    stopPixVerification();
});

// ======================================================================
// BLOCO 1: Link com efeito de ancora scroll
// ======================================================================

function linkAncoraScroll(){
    $("a.link-ancora").on("click", function (e) {
        e.preventDefault();
        const targetId = $(this).data("link");
        const $target = $("#" + targetId);
        if ($target.length) {
            $("html, body").animate({ scrollTop: $target.offset().top }, 600);
        }
    });
}

// ======================================================================
// BLOCO 2: Contador Animado
// ======================================================================

// --- Inicializador do Contador Animado ---
function initAnimatedCounter() {
    let animated = false;
    function checkAndAnimate() {
        const $numCol = $(".num-col");
        if (!$numCol.length) return;
        const section = $numCol.offset().top - $(window).height() + 100;
        if (!animated && $(window).scrollTop() > section) {
            $(".efect-sum").each(function () {
                animateCounter(this);
            });
            animated = true;
        }
    }
    $(window).on("scroll", checkAndAnimate);
    checkAndAnimate();
}

// --- Função do Contador Animado ---
function animateCounter(el, duration = 1500) {
    const $el = $(el);
    const target = parseInt($el.text().replace(/\D/g, "")) || 0;
    let startTime = null;
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        $el.text(Math.floor(progress * target));
        if (progress < 1) requestAnimationFrame(step);
    }
    $el.text("0");
    requestAnimationFrame(step);
}

// ======================================================================
// BLOCO 3: Carrossel Infinito de Logos
// ======================================================================

function startInfiniteCarousel(speed = 1) {
    const $track = $(".clients-track");
    if ($track.length === 0 || $track.children().length === 0) {
        return;
    }
    const $items = $track.children().clone();
    $track.append($items.clone()).append($items.clone()); 
    $track.append($track.html());
    let position = 0;
    const totalWidth = $track[0].scrollWidth / 2;
    function step() {
        position -= speed;
        if (Math.abs(position) >= totalWidth) {
            position = 0;
        }
        $track.css("transform", `translateX(${position}px)`);
        requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// ======================================================================
// BLOCO 5: Formulário de Contato
// ======================================================================

//  --- UI do formulário de contato (máscaras + validações) ---
function initContactUI() {

    const lang = localStorage.getItem("lang") || "pt";

    const $phNome  = $("#placeholder-nome");
    const $phTel   = $("#placeholder-tel");
    const $phEmail = $("#placeholder-email");

    const $boxMsg = $(".form-footer-return");

    function setMsgById(id) {
        if (!id) return $boxMsg.html("");
        const lang = localStorage.getItem("lang") || "pt";
        $boxMsg.html(`<span id="${id}">${translations[lang][id]}</span>`);
    }

    function applyMaskTel($input, lang) {
        $input.off("input").on("input", function () {
            let d = $(this).val().replace(/\D/g, '');

            if (lang === "en") d = d.substring(0, 10);
            else d = d.substring(0, 11);

            let m = "";

            if (lang === "en") {
                if (d.length > 0) m = "(" + d.substring(0, 3);
                if (d.length >= 4) m += ") " + d.substring(3, 6);
                if (d.length >= 7) m += "-" + d.substring(6);
            } else {
                if (d.length > 0) m = "(" + d.substring(0, 2);
                if (d.length >= 3) m += ") " + d.substring(2, 7);
                if (d.length >= 8) m += "-" + d.substring(7);
            }

            $(this).val(m);
        });
    }

    applyMaskTel($phTel, lang);

    function validateName(name) {
        const clean = name.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
        if (clean.length < 3) return { valid: false, id: "name-invalid" };
        return { valid: true, id: null };
    }

    function validatePhone(phone) {
        const digits = phone.replace(/\D/g, "");
        if (digits.length < 10) return { valid: false, id: "number-invalid" };
        return { valid: true, id: null };
    }

    function validateEmail(email) {
        if (!email || email.length < 5 || !email.includes("@") || !email.includes("."))
            return { valid: false, id: "email-invalid" };
        return { valid: true, id: null };
    }

    $phNome.on("keyup", function () {
        let clean = $(this).val().replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
        $(this).val(clean);
        setMsgById(validateName(clean).id);
    });

    $phTel.on("keyup", function () {
        setMsgById(validatePhone($(this).val()).id);
    });

    $phEmail.on("keyup", function () {
        setMsgById(validateEmail($(this).val()).id);
    });

    $("#lang-toggle").on("change", function () {
        const newLang = $(this).is(":checked") ? "en" : "pt";
        applyMaskTel($phTel, newLang);
    });
}

//  --- Função que envia o formulário de contato (fetch) ---
function submitContactForm() {

    $(document).on("submit", "#form-contact", function (e) {
        e.preventDefault();

        const lang = localStorage.getItem("lang") || "pt";
        const $box = $(".form-footer-return");

        const name  = $("#placeholder-nome").val();
        const tel   = $("#placeholder-tel").val();
        const email = $("#placeholder-email").val();

        if (name.length < 3 || tel.replace(/\D/g, "").length < 10 || email.length < 5) {
            return;
        }

        const data = new FormData(this);

        $box.html(`<span>${translations[lang]['msg-sending-email']}</span>`);

        $.ajax({
            url: basePath + "send_email.php",
            method: "POST",
            data: data,
            processData: false,
            contentType: false,
            success: function (msg) {

                const $tmp = $("<div>").html(msg);

                $tmp.find("[id]").each(function () {
                    const id = $(this).attr("id");
                    if (translations[lang][id]) {
                        $(this).html(translations[lang][id]);
                    }
                });

                $box.html($tmp.html());

                setTimeout(() => $box.html(""), 10000);

                $("#form")[0].reset();
            },
            error: function () {
                $box.html(`<span>${translations[lang]['send-email-fail']}</span>`);
            }
        });

    });
}

// ======================================================================
// Bloco 6: Sistemas de login e cadastro do usuário

// Bloco 6.1: Função boleana que verifica se há erro nos inputs
// ======================================================================

function verifyAllInputs(){
    let hasError = false;
    $(".input-verify").each(function () {
        if ($(this).html().trim() !== "") {
            hasError = true;
            return false;
        }
    });
    return !hasError;
}

// ======================================================================
// Bloco 6.2: Elementos para renderização (Login/Cadastro)
// ======================================================================

// --- Renderiza o popup com opção de login ou se registrar ---
function popupLoginRegister(){
    if(!inLog){
        const lang = localStorage.getItem("lang") || "pt";
        let popupTitle = '<span id="popup-title-login-registro">ADQUIRIR LIVRO</span>';
        let popupBody = '<p id="popup-warning-text-buy" style="padding-bottom:20px;text-align:center" class="flex-center-center">Conecte-se à sua conta para prosseguir com a compra.</p><div class="flex-center-between" style="flex-wrap:wrap"><a id="popup-have-account" class="txt-small">Já possuo cadastro</a><a id="popup-dont-have-account" class="txt-small">Desejo me cadastrar</a>';
        popupTitle = translateHTML(popupTitle, lang);
        popupBody  = translateHTML(popupBody, lang);
        openPopup(popupTitle, popupBody);
    }
}

// --- Renderiza o botão de login no header ---
function renderHeaderBtnLogin(){
    return `<a target="_blank" class="flex-center-center btn-login-header" aria-label="Login" title="Login">
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200.000000 223.000000" preserveAspectRatio="xMidYMid meet">
           <g transform="translate(0.000000,223.000000) scale(0.100000,-0.100000)" stroke="none">
                <path d="M913 2220 c-273 -49 -465 -276 -465 -550 0 -154 52 -280 162 -390 110 -110 232 -160 390 -160 158 0 280 50 390 160 111 111 163 237 162 394 -2 294 -223 528 -518 550 -38 2 -92 1 -121 -4z"/>
            <path d="M819 991 c-332 -61 -604 -255 -734 -524 -51 -107 -73 -187 -82 -295 -7 -93 8 -131 61 -156 31 -14 122 -16 936 -16 814 0 905 2 936 16 53 25 68 63 61 156 -23 300 -218 573 -512 718 -158 78 -257 101 -455 105 -91 2 -186 0 -211 -4z"/>
            </g>
        </svg><span class="txt-small">LOGIN</span>
    </a>`
}

// --- Renderiza o usuário logado no header ---
function renderHeaderUserMenu(username, useremail, userphoto){
    const lang = localStorage.getItem("lang") || "pt";
    let html = `<div class="menu-user flex-center-center">
            <div class="menu-user-photo">
                <img src="https://app.jeffersoneva.com/midias/users_perfil/${userphoto}" loading="lazy" alt="Foto de ${username}" />
            </div>
            <div class="menu-user-data">
                <div class="menu-user-name txt-small">${username}</div>
                <div class="menu-user-email txt-minuscule">${useremail}</div>
            </div>
            <div class="triangle-menu"></div>
        </div>
        <div class="pop-up-menu txt-small">
            <div class="header-pop-up-menu flex-center-center">
                <div class="header-pop-up-menu-photo">
                    <img class="foto-pop-up-menu" loading="lazy"  src="https://app.jeffersoneva.com/midias/users_perfil/${userphoto}" alt="${username}" id="photo-user-popup" />
                </div>
            </div>
            <div class="nome-pop-up-menu">
                <h4>${username}</h4>
                <hr />
                <span class="flex-center-center"><a href="https://app.jeffersoneva.com/login/" target="_blank" id="popup-meus-livros">Minha Biblioteca</a></span>
                <span class="logout flex-center-center" id="popup-sair">Sair</span>
            </div>
        </div>`;
    html = translateHTML(html, lang);
    return html;
}

// --- Renderiza o formulário de login ---
function renderFormLogin(){
    const lang = localStorage.getItem("lang") || "pt";
    let popupTitle = `<span id="popup-login-titutlo">ENTRAR COM SUA CONTA</span>`;
    let popupBody = `
        <form id="form-data-user" class="forms-popup">
            <div class="inputs">
                <input type="email" id="popup-email" class="format-email-login" name="email" placeholder="Email" maxlength="40" autocomplete="email" required />
                <div class="input-verify txt-minuscule flex-center-start"></div>
            </div>
            <div class="inputs">
                <input type="password" id="popup-senha" class="password" name="pass" placeholder="Senha" maxlength="20" autocomplete="current-password" required />
                <div class="input-verify txt-minuscule flex-center-start"></div>
            </div>
            <button type="submit" id="popup-btn-login">Entrar</button>
        </form>
        <span class="msg-form-return txt-small"></span>
        <a class="form-register-a txt-small" id="popup-register-link">Não possui cadastro?</a>
    `;
    popupTitle = translateHTML(popupTitle, lang);
    popupBody  = translateHTML(popupBody, lang);
    openPopup(popupTitle, popupBody);
}

// --- Renderiza o formulário de cadastro ---
function renderFormRegister(){
    const lang = localStorage.getItem("lang") || "pt";
    let popupTitle = `<span id="popup-cadastro-titutlo">CADASTRO DE USUÁRIO</span>`;
    let popupBody = `
        <form id="form-new-user" class="forms-popup">
            <div class="inputs">
                <input type="text" class="format-name" id="popup-cadastro-nome" name="first-name" placeholder="Nome" maxlength="18" required />
                <div class="input-verify txt-minuscule flex-center-start"></div>
            </div>
            <div class="inputs">
                <input type="text" class="format-name" id="popup-cadastro-sobrenome" name="last-name" placeholder="Sobrenome" maxlength="18" required />
                 <div class="input-verify txt-minuscule flex-center-start"></div>
            </div>
            <div class="inputs">
                <input type="email" class="format-email" id="popup-cadastro-email" name="email" placeholder="Seu melhor email" maxlength="40" autocomplete="email" required />
                <div class="input-verify txt-minuscule flex-center-start"></div>
            </div>
            <div class="inputs">
                <input type="password" id="password" name="password" placeholder="Crie uma senha" maxlength="20" autocomplete="new-password" required />
                <div class="input-verify txt-minuscule flex-center-start"></div>
            </div>
            <div class="inputs">
                <input type="password" id="password-confirm" name="password-confirm" placeholder="Repita sua senha" maxlength="20" autocomplete="new-password" required />
                <div class="input-verify txt-minuscule flex-center-start"></div>
            </div>
            <div class="txt-minuscule" id="forms-warning-docs">Ao se cadastrar você estará concordando com os <a href='https://www.jeffersoneva.com/termos-de-uso' target='_blank'>Termo de Uso</a> e a <a href='https://www.jeffersoneva.com/politica-de-privacidade' target='_blank'>Política de Privacidade</a>.</div>
            <button type="submit" id="cadastro-bnt">Cadastrar</button>
        </form>
        <span class="msg-form-return txt-small"></span>
        <a class="form-login-a txt-small" id="popup-login-link">Já possui cadastro?</a>
    `;
    popupTitle = translateHTML(popupTitle, lang);
    popupBody  = translateHTML(popupBody, lang);
    openPopup(popupTitle, popupBody);
}

// --- Renderiza o formuláro de redefinição de senha ---
function renderFormForget(){
    const lang = localStorage.getItem("lang") || "pt";
    let popupTitle = `<span id="popup-forget-titulo">ESQUECI MINHA SENHA</span>`;
    let popupBody = `
        <form id="form-forget" class="forms-popup">
            <div class="inputs">
                <input type="email" class="format-email-forget" id="popup-forget-email" name="email" placeholder="Digite seu email" maxlength="40" required />
                <div class="input-verify txt-minuscule flex-center-start"></div>
            </div>
            <button type="submit" id="forget-bnt">Redefinir senha</button>
        </form>
        <span class="msg-form-return txt-small"></span>
        <a class="form-register-a txt-small" id="popup-register-link">Não possui cadastro?</a>
    `;
    popupTitle = translateHTML(popupTitle, lang);
    popupBody  = translateHTML(popupBody, lang);
    openPopup(popupTitle, popupBody);
}

// --- Renderiza o sistema de pagamento do Mercado Pago
function renderPayment(){
    const lang = localStorage.getItem("lang") || "pt";
    let popupTitle = `<span id="popup-mp-title">Dados de pagamento</span>`;
    popupTitle = translateHTML(popupTitle, lang);
    openPopup(popupTitle);
}

// ======================================================================
// Bloco 6.3: Formatação de inputs do formulário de login
// ======================================================================

function formatInputsLogin(){

    // --- Email ---
    $(document).on('keyup', '.format-email-login', function () {
        const lang = localStorage.getItem("lang") || "pt";
        var input = $(this)
        var value = input.val()
        var inputVerify = input.closest('.inputs').find('.input-verify')
        var emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        if (!emailValido) {
            if (value.length === 0) {
                inputVerify.css({'padding-top':'0px'})
                inputVerify.html("")
            } else {
                inputVerify.css({'padding-top':'10px'})
                let html = `<span id="login-invalid-email">Email inválido</span>`;
                html = translateHTML(html, lang);
                inputVerify.html(html)
            }
            input.css({'border':'1px solid var(--quinary-3)'})
        } else {
            inputVerify.css({'padding-top':'0px'})
            inputVerify.html("")
            input.css({'border':'1px solid var(--light-4)'})
        }
    });

    // --- Senha ---
    $(document).on('keyup', '.password', function () {
        const lang = localStorage.getItem("lang") || "pt";
        var input = $(this)
        var value = input.val()
        var inputVerify = input.closest('.inputs').find('.input-verify')
        if (value.length < 7) {
            inputVerify.css({'padding-top':'10px'})
            let html = `<span id="invalid-senha">Mínimo 7 caracteres</span>`;
            html = translateHTML(html, lang);
            inputVerify.html(html)
            input.css({'border':'1px solid var(--quinary-3)'})
        } else {
            inputVerify.css({'padding-top':'0px'})
            inputVerify.html("")
            input.css({'border':'1px solid var(--light-4)'})
        }
    });
}

// ======================================================================
// Bloco 6.4: Função que efetua o login do usuário
// ======================================================================

function loginUser(){

    const $btn = $("#popup-btn-login");
    if ($btn.prop("disabled")) return;

    if(verifyAllInputs()){
        $.ajax({
        method: "POST",
            url: basePath + "functions/login.php",
            data: $('#form-data-user').serialize(),
            dataType: "json",
            cache: false,
            beforeSend: function(){
                App.state.blockUnload = true
                $btn.prop("disabled", true).addClass("btn-disabled");
                $(".msg-form-return").html('<div class="flex-center-center" style="padding-top:30px"><img src="' + loadingImg.src  +'" width="32" alt="Carregando" /></div>')  
            }
        })
        .done(function(response){
            App.state.blockUnload = false;
            if (response.status === "Success") {
                inLog = true;
                startVerifyLog();
                let photo = response.userphoto ? response.userphoto : 'default.avif';
                if ($(".btn-login-header").length) {
                    $(".btn-login-header").remove();
                }
                if ($(".menu-user").length === 0) {
                    $(".header-btns").append(
                        renderHeaderUserMenu(
                            response.username,
                            response.useremail,
                            photo
                        )
                    );
                }
                if (clickLog && pendingBookId) {
                    const lang = localStorage.getItem("lang") || "pt";
                    var title =  '<span id="popup-mp-title">Dados de pagamento</span>'
                    $(".popup-header-count").html(translateHTML(title, lang));
                    const bookId = pendingBookId; 
                    resetBuyFlow();
                    verifyExistBook(bookId)
                    .done(response => {
                        if (response.status === "no-purchase") {
                            startPaymentFlow(
                                response.useremail,
                                bookId,
                                response.bookname,
                                response.bookprice
                            );
                        } else {
                            $(".popup-count").html(translateHTML(response.message, lang));
                        }
                    })
                    .fail(err => {
                        console.error(err.responseText);
                        $(".popup-count").html("Erro ao verificar o livro. Tente novamente.");
                    });
                } else {
                    window.closePopup();
                }
            } else {
                $btn.prop("disabled", false).removeClass("btn-disabled");
                const lang = localStorage.getItem("lang") || "pt";
                let html = `
                    <div class="flex-center-center" style="padding-top:30px">
                        ${response.message}
                    </div>
                `;
                $(".msg-form-return").html(translateHTML(html, lang));
            }
        })
        .fail(function(error) {
            App.state.blockUnload = false;
            $(".msg-form-return").html('<div class="flex-center-center" style="padding-top:30px" id="error-ajax">Ops, servidor em manutenção. Tente novamente mais tarde.</div>');
            $btn.prop("disabled", false).removeClass("btn-disabled");
            console.log(error.responseText);
        })
    } 
}

// ======================================================================
// Bloco 6.5: Comportamento do menu do usuário logado
// ======================================================================

function menuUserBehavior(){

    // --- Abre e fecha o menu popup do usuário logado ---
    $(document).on("click", ".menu-user", function (e) {
        e.stopPropagation(); // impede conflito com o clique fora
        $(".pop-up-menu").toggle(150);
    });

    // --- Fecha o menu ao clicar fora ---
    $(document).on("click", function (e) {
        if (!$(e.target).closest(".pop-up-menu, .menu-user").length) {
            $(".pop-up-menu").hide(150);
        }
    });

    // --- Fecha o menu ao rolar a página ---
    $(window).on("scroll", function () {
        if ($(".pop-up-menu").is(":visible")) {
            $(".pop-up-menu").hide(150);
        }
    });

    // --- Fecha o menu ao pressionar ESC ---
    $(document).on("keydown", function (e) {
        if (e.key === "Escape") {
            if ($(".pop-up-menu").is(":visible")) {
                $(".pop-up-menu").hide(150);
            }
        }
    });
}

// ======================================================================
// Bloco 6.6: Verifca a cada X segundos se o usuário continua logado
// ======================================================================

function verifyLog() {

    $.post(basePath + "functions/verifyLog.php", {}, function (response) {

        const isSuccess = response.status === "Success";
        const isOnline  = isSuccess && response.message === "Online";

        if (isOnline) {
            if (!inLog) {
                inLog = true;
                $(".btn-login-header").remove();
                if (!$(".menu-user").length) {
                    $(".header-btns").append(renderHeaderUserMenu(response.username,response.useremail,response.userphoto));
                }
            }
            return;
        }

        if (inLog) {
            inLog = false;
            $(".menu-user").remove();
            $(".btn-login-header").length || $(".header-btns").append(renderHeaderBtnLogin());
            $(".buy-button").attr("data-useremail", "-");
        }

        if (!isSuccess) {
            console.error("Erro:", response.message);
        }

    }, "json")
    .fail(() => console.error("Erro na verificação de login."));
}

// --- Inicia a execução da função que verifica o login ---
function startVerifyLog() {
    if (verifyLogInterval) return;
    verifyLog();
    verifyLogInterval = setInterval(verifyLog, VERIFY_LOG_DELAY);
}

// --- Para a execução da função que verifica o login ---
function stopVerifyLog() {
    if (!verifyLogInterval) return;
    clearInterval(verifyLogInterval);
    verifyLogInterval = null;
}

// ======================================================================
// Bloco 6.7: Logout
// ======================================================================

function logoutUser(){
    $.ajax({
        method: "POST",
        url: basePath + "functions/logout.php",
        cache: false,
        dataType: "json",
        beforeSend: function(){
            App.state.blockUnload = true;
            $(".logout").html('<div class="flex-center-center"><img src="' + loadingImg.src  +'" width="25" alt="Carregando" /></div>')  
        }
    })
    .done(function(response){
        if(response.status === "Success"){
           inLog = false;
            stopVerifyLog();
            pendingBookId = null
            if ($(".pop-up-menu").length) {
                $(".pop-up-menu").hide(150);
            }
            if ($(".menu-user").length) {
                $(".menu-user").remove();
            }
            if ($(".pop-up-menu").length) {
                $(".pop-up-menu").remove();
            }
            if ($(".header-btns .btn-login-header").length === 0) {
                $(".header-btns").append(renderHeaderBtnLogin());
            }
        }
    })
    .fail(function(error){
        openPopup('Erro', error.responseText)
    })
    .always(function() {
        App.state.blockUnload = false;
    })
}

// ======================================================================
// Bloco 6.8: Formatação de inputs do formulário de redefinição de senha
// ======================================================================

function formatInputsForgot(){

    // --- Email ---
    $(document).on('keyup', '.format-email-forget', function () {
        const lang = localStorage.getItem("lang") || "pt";
        var input = $(this)
        var value = input.val()
        var inputVerify = input.closest('.inputs').find('.input-verify')
        var emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        if (!emailValido) {
            if (value.length === 0) {
                inputVerify.css({'padding-top':'0px'})
                inputVerify.html("")
            } else {
                inputVerify.css({'padding-top':'10px'})
                let html = `<span id="forget-invalid-email">Email inválido</span>`;
                html = translateHTML(html, lang);
                inputVerify.html(html)
            }
            input.css({'border':'1px solid var(--quinary-3)'})
        } else {
            inputVerify.css({'padding-top':'0px'})
            inputVerify.html("")
            input.css({'border':'1px solid var(--light-4)'})
        }
    });
}

// ======================================================================
// Bloco 6.9: Sistema de redefinição se senha
// ======================================================================

function forgetPass(){

    const $btn = $("#forget-bnt");
    if ($btn.prop("disabled")) return;

    if(verifyAllInputs()){
        $.ajax({
            method: "POST",
            url: basePath + 'functions/forgetPass.php',
            data: $('#form-forget').serialize(),
            cache: false,
            dataType: "json",
            beforeSend: function(){
                App.state.blockUnload = true;
                $btn.prop("disabled", true).addClass("btn-disabled");
                $(".msg-form-return").html('<div class="flex-center-center" style="padding-top:30px"><img src="' + loadingImg.src  +'" width="32" alt="Carregando" /></div>')  
            }
        })
        .done(function(response){
            App.state.blockUnload = false;
            $btn.prop("disabled", false).removeClass("btn-disabled");
            const lang = localStorage.getItem("lang") || "pt";
            let html = `
                <div class="flex-center-center" style="padding-top:30px">
                    ${response.message}
                </div>
            `;
            $(".msg-form-return").html(translateHTML(html, lang));
        })
        .fail(function(error) {
            App.state.blockUnload = false;
            $(".msg-form-return").html('<div class="flex-center-center" style="padding-top:30px" id="error-ajax">Ops, servidor em manutenção. Tente novamente mais tarde.</div>');
            $btn.prop("disabled", false).removeClass("btn-disabled"); 
            console.log(error.responseText);
        })
    }
}

// ======================================================================
// Bloco 6.10: Formatação de inputs do formulário de cadastro
// ======================================================================

function formatInputsRegister(){

    // --- Nome ---
    $(document).on('keyup', '.format-name', function () {
        const lang = localStorage.getItem("lang") || "pt";
        const input = $(this);
        const inputVerify = input.closest('.inputs').find('.input-verify');
        let value = input.val().trimStart();
        let filtered = value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
        let firstName = filtered.split(' ')[0];
        input.val(firstName);
        if (firstName.length === 0) {
            inputVerify.html("").css({'padding-top': '0px'});
            input.css({'border': '1px solid var(--light-4)'});
            return;
        }
        if (firstName.length < 2) {
            inputVerify.css({'padding-top': '10px'});
            let html = `<span id="invalid-name-short">Digite ao menos 2 caracteres</span>`;
            inputVerify.html(translateHTML(html, lang));
            input.css({'border': '1px solid var(--quinary-3)'});
            return;
        }
        inputVerify.html("").css({'padding-top': '0px'});
        input.css({'border': '1px solid var(--light-4)'});
    });

    // --- Email ---
    $(document).on('keyup', '.format-email', function () {
        const lang = localStorage.getItem("lang") || "pt";
        const input = $(this);
        const value = input.val();
        const inputVerify = input.closest('.inputs').find('.input-verify');
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!emailValido) {
            if (value.length === 0) {
                inputVerify.html("").css({'padding-top': '0px'});
            } else {
                inputVerify.css({'padding-top': '10px'});
                let html = `<span id="cadastro-invalid-email">Email inválido</span>`;
                inputVerify.html(translateHTML(html, lang));
            }
            input.css({'border': '1px solid var(--quinary-3)'});
            return;
        }
        let basePath = window.location.pathname.includes("/livro/") ? "../" : "./";
        $.ajax({
            url: basePath + 'functions/returnEmail.php',
            method: 'GET',
            dataType: 'html',
            cache: false,
            data: { email: value }
        })
        .done(function (response) {
            if (response === "1") {
                inputVerify.css({'padding-top': '10px'});
                let html = `<span id="email-exists">Email já cadastrado</span>`;
                inputVerify.html(translateHTML(html, lang));
                input.css({'border': '1px solid var(--quinary-3)'});
            } 
            else if (response === "0") {
                inputVerify.html("").css({'padding-top': '0px'});
                input.css({'border': '1px solid var(--light-4)'});
            } 
            else {
                inputVerify.css({'padding-top': '10px'});
                let html = `<span id="email-check-error">Erro ao verificar email</span>`;
                inputVerify.html(translateHTML(html, lang));
                input.css({'border': '1px solid var(--quinary-3)'});
            }
        })
        .fail(function () {
            console.log("Erro na verificação do email.");
            inputVerify.css({'padding-top': '10px'});
            let html = `<span id="email-check-error">Erro ao verificar email</span>`;
            inputVerify.html(translateHTML(html, lang));
            input.css({'border': '1px solid var(--quinary-3)'});
        });
    });

    // --- Senhas ---
    $(document).on('keyup', '#password, #password-confirm', function () {
        const lang = localStorage.getItem("lang") || "pt";
        const password = $('#password');
        const confirmPassword = $('#password-confirm');
        const passwordVal = password.val();
        const confirmVal = confirmPassword.val();
        const verifyPass = password.closest('.inputs').find('.input-verify');
        const verifyConfirm = confirmPassword.closest('.inputs').find('.input-verify');
        verifyPass.html("").css({'padding-top':'0px'});
        verifyConfirm.html("").css({'padding-top':'0px'});
        password.css({'border':'1px solid var(--light-4)'});
        confirmPassword.css({'border':'1px solid var(--light-4)'});
        if (passwordVal.length > 0 && passwordVal.length < 7) {
            verifyPass.css({'padding-top': '10px'});
            let html = `<span id="password-too-short">Senha muito curta. Use pelo menos 7 caracteres.</span>`;
            verifyPass.html(translateHTML(html, lang));
            password.css({'border':'1px solid var(--quinary-3)'});
        }
        if (confirmVal.length > 0 && confirmVal.length < 7) {
            verifyConfirm.css({'padding-top': '10px'});
            let html = `<span id="password-too-short">Senha muito curta. Use pelo menos 7 caracteres.</span>`;
            verifyConfirm.html(translateHTML(html, lang));
            confirmPassword.css({'border':'1px solid var(--quinary-3)'});
        }
        if (passwordVal.length >= 7 && confirmVal.length >= 7) {
            if (passwordVal !== confirmVal) {
                verifyConfirm.css({'padding-top': '10px'});
                let html = `<span id="password-mismatch">As senhas não coincidem.</span>`;
                verifyConfirm.html(translateHTML(html, lang));
                confirmPassword.css({'border':'1px solid var(--quinary-3)'});
            }
        }
    });
}

// ======================================================================
// Bloco 6.11: Sistema de cadastro do usuário
// ======================================================================

function registerUser(){

    const $btn = $("#cadastro-bnt");
    if ($btn.prop("disabled")) return;

    if (verifyAllInputs()) {
        $.ajax({
            method: "POST",
            url: basePath + 'functions/register.php',
            data: $('#form-new-user').serialize(),
            cache: false,
            dataType: "json",
            beforeSend: function () {
                App.state.blockUnload = true;
                $btn.prop("disabled", true).addClass("btn-disabled");
                $(".msg-form-return").html(
                    '<div class="flex-center-center" style="padding-top:30px">' +
                    '<img src="' + loadingImg.src + '" width="32" alt="Carregando" />' +
                    '</div>'
                );
            }
        })
        .done(function (response) {
            App.state.blockUnload = false;
            if (response.status === "Success") {
                inLog = true;
                $(".btn-login-header").length && $(".btn-login-header").remove();
                if ($(".menu-user").length === 0) {
                    $('.header-btns').append(renderHeaderUserMenu(response.username,response.useremail,response.userphoto));
                }
                if (clickLog && pendingBookId) {
                    const lang = localStorage.getItem("lang") || "pt";
                    const title =  '<span id="popup-mp-title">Dados de pagamento</span>'
                    $(".popup-header-count").html(translateHTML(title, lang));
                    const bookId = pendingBookId;
                    resetBuyFlow();
                    verifyExistBook(bookId)
                    .done(response => {
                        if (response.status === "no-purchase") {
                            startPaymentFlow(
                                response.useremail,
                                bookId,
                                response.bookname,
                                response.bookprice
                            );
                        } else {
                            $(".popup-count").html(translateHTML(response.message, lang));
                        }
                    })
                    .fail(err => console.error(err.responseText));
                }else{
                    window.closePopup();
                }
            }else{
                $btn.prop("disabled", false).removeClass("btn-disabled");
                const lang = localStorage.getItem("lang") || "pt";
                let html = `
                    <div class="flex-center-center" style="padding-top:30px">
                        ${response.message}
                    </div>
                `;
                $(".msg-form-return").html(translateHTML(html, lang));
            }
        })
        .fail(function(error) {
            App.state.blockUnload = false;
            $(".msg-form-return").html('<div class="flex-center-center" style="padding-top:30px" id="error-ajax">Ops, servidor em manutenção. Tente novamente mais tarde.</div>');
            $btn.prop("disabled", false).removeClass("btn-disabled");
            console.log(error.responseText);
        })
    }
}

// ======================================================================
// Bloco 7: Aplica um desconto via cupom
// ======================================================================

function verifyCoupon() {

    $(document).on("submit", "#form-coupon", function (e) {
        e.preventDefault();

        const lang = localStorage.getItem("lang") || "pt";

        const $form = $(this);
        const $book = $form.closest(".book-feature, .ebook-highlight-content");

        const $message = $book.find(".coupon-message");
        const $priceEl = $book.find("#real-price-book");
        const coupon = $form.find("#coupon-discount").val();

        if (discountPercentage !== null) {
            $message.html(translateHTML('<span id="exist-coupon">Você só pode usar um cupom por vez.</span>',lang));
            return;
        }

        $.ajax({
            method: "POST",
            url: basePath + "functions/verifyCoupon.php",
            dataType: "json",
            data: { coupon },
            beforeSend: function () {
                App.state.blockUnload = true;
                $message.html(`<img src="${loadingImg.src}" width="25" alt="Carregando" />`);
            }
        })
        .done(function (response) {

            if (response.status === "Fail") {
                $message.html(translateHTML(response.message, lang));
                return;
            }

            // ✅ aplica desconto apenas neste livro
            discountPercentage = parseFloat(response.status);

            let priceText = $priceEl.text();
            let price = parseFloat(
                priceText.replace(/\./g, '').replace(',', '.')
            );

            let discountPercent = parseFloat(response.status);
            let finalPrice = price - (price * (discountPercent / 100));

            $message.html(translateHTML(response.message, lang));
            animatePriceDecrement($priceEl, finalPrice);
        })
        .fail(function () {
            $message.html("Erro ao validar cupom.");
        })
        .always(function () {
            App.state.blockUnload = false;
        });
    });
}


// --- Função que decrementa o valor de forma animada ---
function animatePriceDecrement(selector, newValue, duration = 500) {
    const $el = $(selector);

    let currentText = $el.text();
    let currentValue = parseFloat(
        currentText.replace(/\./g, '').replace(',', '.')
    );

    if (isNaN(currentValue)) currentValue = newValue;

    const startValue = currentValue;
    const endValue = newValue;
    const startTime = performance.now();

    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);

        // easing suave (easeOut)
        const eased = 1 - Math.pow(1 - progress, 3);

        const value = startValue - ((startValue - endValue) * eased);

        $el.text(
            value.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        );

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            // garante valor final exato
            $el.text(
                endValue.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })
            );
        }
    }

    requestAnimationFrame(step);
}

// ======================================================================
// Bloco 8: Inicia a aquisição de um livro
// ======================================================================

// --- Verifica se o usuário já possui livro e retorna mensagem ---
function verifyExistBook(bookid) {
    return $.post(
        `${basePath}functions/verifyReturnBuy.php`,
        { bookid },
        null,
        "json"
    );
}

// --- Inicia o fluxo de pagamento ---
function startPaymentFlow(useremail, bookid, bookname, bookprice) {
    const lang = localStorage.getItem("lang") || "pt";
    const popupBody = ` <div id="paymentBrick_container" style="width:100%;margin:0;padding:0;"></div><div id="status_container"></div>`;
    $(".popup-count").html(translateHTML(popupBody, lang));
    waitForContainer("#paymentBrick_container", () => {
        renderPaymentBrick(useremail, bookid, bookname, bookprice);
    });
}

// --- Aguarda até o container existir (anti erro do MP) ---
function waitForContainer(selector, callback, attempts = 0) {
    if ($(selector).length > 0) {
        callback();
        return;
    }
    if (attempts > 20) return;
    setTimeout(() => {
        waitForContainer(selector, callback, attempts + 1);
    }, 100);
}

// --- Função que tranforma o valor real ---
function parsePrice(value) {
    if (typeof value === "number") return value;
    let str = String(value).trim();
    // Se tiver vírgula, assume PT-BR
    if (str.includes(',')) {
        str = str.replace(/\./g, '').replace(',', '.');
    }
    return parseFloat(str);
}

// --- Renderiza Payment Brick dentro do popup ---
let paymentBrickInstance = null;

function renderPaymentBrick(useremail, bookid, bookname, bookprice) {

    let amount = parsePrice(bookprice);

    if (isNaN(amount)) {
        console.error("Preço inválido recebido:", bookprice);
        $("#popup-count").html("<p>Erro: valor do livro inválido.</p>");
        return;
    }

    if (discountPercentage !== null && discountPercentage > 0) {
        amount = amount - (amount * (discountPercentage / 100));
        amount = Number(amount.toFixed(2));
    }

    /* let PublicKey = "TEST-19d7f94d-034a-46b1-9d30-8e20a0c4271d"; */
    let PublicKey = "APP_USR-76053789-6549-4615-a3b5-1379e13a52f3";

    const mp = new MercadoPago(PublicKey, { locale: "pt-BR" });
    const bricks = mp.bricks();

    if (paymentBrickInstance) {
        paymentBrickInstance.unmount();
        paymentBrickInstance = null;
    }

    bricks.create("payment", "paymentBrick_container", {

        initialization: {
            amount: amount,
            payer: {
                email: useremail,
                entityType: "individual"
            }
        },

        customization: {
            visual: { style: { theme: "default" } },
            paymentMethods: {
                creditCard: "all",
                debitCard: "all",
                ticket: "all",
                bankTransfer: "all"
            }
        },

        callbacks: {

            onReady: () => {
                return true;
            },

            onSubmit: ({ formData }) => {
                return new Promise((resolve, reject) => {

                    formData.description = bookname;
                    formData.external_reference = bookid;

                    formData.metadata = {
                        user_email: useremail
                    };

                    fetch(basePath + "functions/process_payment.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formData)
                    })
                    .then(res => res.json())
                    .then(data => {

                        const lang = localStorage.getItem("lang") || "pt";

                        if (data.status === "success") {

                            const p = data.response;

                            // 🔐 PIX URL SEGURA (não quebra nunca)
                            const pixUrl = p?.point_of_interaction?.transaction_data?.ticket_url || null;

                            if (p.payment_method_id === "pix") {
                                payPix = true;
                                startPixVerification(p.id);
                            }

                            const messages = {

                                approved: `
                                    <p id="payment-approved-title" style="margin-bottom:20px;">
                                        <strong>Pagamento aprovado com sucesso!</strong> 🎉
                                    </p>
                                    <p id="payment-approved-text">
                                        Seu livro já está disponível em sua biblioteca.
                                        <a id="payment-approved-link"
                                        href="https://app.jeffersoneva.com/login"
                                        target="_blank">
                                            Clique aqui para acessar
                                        </a>
                                    </p>
                                `,

                                pending: `
                                    <p id="payment-pending-title" style="margin-bottom:20px;">
                                        <strong>Pagamento pendente ⏳</strong>
                                    </p>
                                    <p id="payment-pending-text">
                                        Seu pagamento está aguardando confirmação.
                                        Assim que for aprovado, o acesso será liberado automaticamente.
                                    </p>
                                `,

                                in_process: `
                                    <p id="payment-processing-title" style="margin-bottom:20px;">
                                        <strong>Pagamento em processamento 🔄</strong>
                                    </p>
                                    <p id="payment-processing-text">
                                        Estamos processando seu pagamento.
                                        Aguarde alguns instantes antes de tentar novamente.
                                    </p>
                                `,

                                rejected: `
                                    <p id="payment-rejected-title" style="margin-bottom:20px;">
                                        <strong>Pagamento não aprovado ❌</strong>
                                    </p>
                                    <p id="payment-rejected-text">
                                        Não foi possível concluir o pagamento.
                                        Verifique os dados informados ou tente outro meio de pagamento.
                                    </p>
                                `,

                                cancelled: `
                                    <p id="payment-cancelled-title" style="margin-bottom:20px;">
                                        <strong>Pagamento cancelado</strong>
                                    </p>
                                    <p id="payment-cancelled-text">
                                        O pagamento foi cancelado.
                                        Você pode tentar novamente quando desejar.
                                    </p>
                                `,

                                refunded: `
                                    <p id="payment-refunded-title" style="margin-bottom:20px;">
                                        <strong>Pagamento estornado</strong>
                                    </p>
                                    <p id="payment-refunded-text">
                                        O valor pago foi devolvido.
                                        Em caso de dúvidas, entre em contato com o suporte.
                                    </p>
                                `,

                                pix: pixUrl ? `
                                    <p class="flex-center-center" id="payment-pix-title" style="margin-bottom:20px;">
                                        <strong>Pagamento via PIX disponível</strong>
                                    </p>

                                    <p class="txt-small flex-center-center" id="payment-pix-text">
                                        A chave PIX também foi enviada para seu e-mail.
                                    </p>

                                    <div class="flex-center-center" style="border-top:2px solid var(--primary-3); border-bottom:2px solid var(--primary-3);margin:30px 0;padding:30px 0;">
                                        <div style="width:180px;height:180px;padding:20px 20px 18px 20px;background-color:var(--light-2);border-radius:10px;background-image:url('https://www.jeffersoneva.com/assets/img/loading.gif');background-repeat:no-repeat;background-cover:64px 64px;background-position:center;">
                                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(p.point_of_interaction.transaction_data.qr_code)}" alt="PIX QR Code" />
                                        </div>
                                    </div>

                                    <div style="margin:15px 0 20px 0;text-align:center;">
                                        <p id="payment-pix-copy" style="font-size:13px;margin-bottom:8px;">Ou copie o código PIX:</p>
                                        <textarea id="pix-copy-code" readonly style="width:100%;height:80px;padding:10px 0;border:0;resize:none;color:var(--dark-4)">${p.point_of_interaction.transaction_data.qr_code}</textarea>
                                        <button id="btn-copy-pix" onclick="copyPixCode()" style="margin:10px 0;padding:8px 16px;border-radius:6px;border:none;background:var(--primary-3);color:#fff;font-weight:600;cursor:pointer;">
                                            Copiar código PIX
                                        </button>
                                    </div>

                                    <div class="txt-small flex-center-center" style="padding-bottom:20px;">
                                        <a href="${pixUrl}" target="_blank">
                                            <span id="payment-pix-link">Link de pagamento</span>
                                        </a>
                                    </div>
                                ` : `
                                    <p id="payment-pix-wait-title">
                                        <strong>Pagamento via PIX em processamento</strong>
                                    </p>

                                    <p id="payment-pix-wait-text">
                                        Estamos gerando sua chave PIX. Isso pode levar alguns instantes. Assim que estiver disponível, você receberá um email para efetuar o pagamento.
                                    </p>
                                `,

                                default: `
                                    <p id="payment-unknown-title" style="margin-bottom:20px;">
                                        <strong>Status do pagamento</strong>
                                    </p>
                                    <p id="payment-unknown-text">
                                        Status atual: ${p.status}
                                    </p>
                                `
                            };

                            // 🎯 Escolha da mensagem correta
                            const html =
                                p.payment_method_id === "pix"
                                    ? messages.pix
                                    : messages[p.status] || messages.default;

                            $(".popup-count").html(translateHTML(html, lang));
                            resolve({ id: p.id });

                        } else {

                            $(".popup-count").html(
                                translateHTML(
                                    `<p id="payment-error">Erro: ${data.message}</p>`,
                                    lang
                                )
                            );
                            reject(data.message);
                        }
                    })
                    .catch(err => {
                        console.error("Erro no pagamento:", err);
                        $(".popup-count").html("Falha no pagamento.");
                        reject(err);
                    });
                });
            },

            onError: (error) => {
                console.error("Erro no Payment Brick:", error);
                $(".popup-count").html("Erro ao carregar o pagamento.");
            }
        }

    }).then(instance => {
        paymentBrickInstance = instance;
    });
}

// ============================================================
// Bloco 7.1: Mensagens e retornos em caso de pagamento por PIX
// ============================================================

// --- Copia a Chave PIX ---
function copyPixCode(){
    const textarea = document.getElementById("pix-copy-code");
    textarea.select();
    textarea.setSelectionRange(0, 99999); // mobile
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    textarea.blur();
    $("#btn-copy-pix").html("Chave PIX Copiada ✅");
}

// --- Verifica se pagamento foi aprovado e muda o conteúdo do popup ---
function startPixVerification(paymentId) {

    if (pixInterval) {
        clearInterval(pixInterval);
    }

    pixInterval = setInterval(() => {

        $.ajax({
            url: basePath + "functions/verify_payment.php",
            method: "POST",
            dataType: "json",
            data: { payment_id: paymentId }
        })
        .done(function(response){
            if (response.status === 1) {

                clearInterval(pixInterval);
                pixInterval = null;
                payPix = false;

                const lang = localStorage.getItem("lang") || "pt";

                let popupBody = `
                    <div style="text-align:center;">
                        <p id="approved-pay-title" class="flex-center-center" style="margin:0 0 15px 0">🎉 Pagamento aprovado com sucesso 🎉</p>
                        <p id="approved-pay-subtitle" style="color:var(--dark-4);margin-bottom:25px;" class="txt-small">Seu livro já está disponível na sua biblioteca.</p>
                        <a id="approved-pay-link" href="https://app.jeffersoneva.com/login" target="_blank" style="display:inline-block;padding:12px 26px;background:var(--primary-3);color:#fff;font-weight:600;border-radius:8px;box-shadow:0 6px 14px rgba(0,0,0,.15);transition:all .2s ease;"
                        onmouseover="this.style.transform='scale(1.05)'"
                        onmouseout="this.style.transform='scale(1)'"
                        >📚 Acessar biblioteca</a>
                        <p id="approved-pay-footer" class="txt-minuscule" style="margin-top:18px;color:var(--dark-3);">Você já pode começar a leitura agora mesmo.</p>
                    </div>
                `;
                popupBody  = translateHTML(popupBody, lang);
                $(".popup-count").html(popupBody);
            }

        })
        .fail(function(){
            console.warn("Falha ao verificar pagamento PIX");
        });

    }, 500); // ⏱️ 0.5 segundos
}

// ============================================================
// Inicialização DOM
// ============================================================

$(document).ready(function () {

    // --- Verificação inicial de usuário logado
    if ($(".menu-user").length > 0) {
        inLog = true;
    } else {
        inLog = false;
    }

    // BLOCO 1: Link com efeito de ancora scroll
    linkAncoraScroll();

    // BLOCO 2: Contador Animado
    initAnimatedCounter();

    // BLOCO 3: Carrossel Infinito de Logos
    startInfiniteCarousel(1);

    // BLOCO 4: Canvas Nodes
    initCanvasNodes();

    // BLOCO 5: Formulário de Contato

    //  --- UI do formulário de contato (máscaras + validações) ---
    initContactUI();

    //  --- Função que envia o formulário de contato (fetch) ---
    submitContactForm()

    // Bloco 6: Sistemas de login e cadastro do usuário

    // Bloco 6.2: Elementos para renderização (Login/Cadastro)
    
    // --- Renderiza o formulário de login ---
    $(document).on("click", "#popup-have-account, .btn-login-header, #popup-login-link", function () {
        renderFormLogin()
    });

    // --- Renderiza o formulário de cadastro ---
    $(document).on("click", "#popup-dont-have-account, #popup-register-link", function () {
        renderFormRegister()
    });

    // --- Renderiza o formuláro de redefinição de senha ---
    $(document).on("click", "#redefinir-senha", function () {
        renderFormForget()
    });

    // Bloco 6.3: Formatação de inputs do formulário de login
    formatInputsLogin();
    
    // Bloco 6.4: Função que efetua o login do usuário
    $(document).on('submit', '#form-data-user', function (e){
        e.preventDefault();
        loginUser()
    })

    // Bloco 6.5: Comportamento do menu do usuário logado
    menuUserBehavior()

    // Bloco 6.6: Verifca a cada X segundos se o usuário continua logado
    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") {
            startVerifyLog();
        } else {
            stopVerifyLog();
        }
    });

    startVerifyLog();

    // Bloco 6.7: Logout
    $(document).on("click", ".logout", function () {
        logoutUser()
    })

    // Bloco 6.8: Formatação de inputs do formulário de redefinição de senha
    formatInputsForgot();

    // Bloco 6.9: Sistema de redefinição se senha
    $(document).on('submit', '#form-forget', function (e){
        e.preventDefault();
        forgetPass();
    })

    // Bloco 6.10: Formatação de inputs do formulário de cadastro
    formatInputsRegister();

    // Bloco 6.11: Sistema de cadastro do usuário
    $(document).on('submit', '#form-new-user', function (e){
        e.preventDefault();
        registerUser();
    })
    
    // Bloco 7: Aplica um desconto via cupom
    verifyCoupon();

    // Bloco 8: Inicia a aquisição de um livro
    $(document).on("click", ".buy-button", function () {

        clickLog = true;
        pendingBookId = $(this).data("bookid");

        if (inLog && $(".menu-user").length > 0) {

            renderPayment()
            verifyExistBook(pendingBookId)

            .done(response => {
                const lang = localStorage.getItem("lang") || "pt";
                if (!inLog) {
                    popupLoginRegister();
                    return;
                }
                if (response.status === "no-purchase") {
                    startPaymentFlow(response.useremail,pendingBookId,response.bookname,response.bookprice);
                } else {
                    $(".popup-count").html(
                        translateHTML(response.message, lang)
                    );
                }
            })
            .fail(err => {
                console.error(err);
                $(".popup-count").html("Erro ao verificar compra.");
            });

        } else {
            popupLoginRegister();
        }
    });

    // Frescura
    const versiculos = [
        "Entrega o teu caminho ao Senhor; confia, e Ele tudo fará. ✨",
        "Tudo posso naquele que me fortalece. 💪",
        "O choro pode durar uma noite, mas a alegria vem pela manhã. 🌅",
        "Seja forte e corajosa; Deus está com você em todos os caminhos. 🌿",
        "Aquieta o teu coração, pois Deus cuida de tudo. 🤍",
        "O Senhor é a tua luz e a tua salvação; de quem terás medo?",
        "Espere no Senhor, seja forte, e Ele fortalecerá o teu coração. 🌟",
        "Mesmo no deserto, Deus faz brotar fontes. 💧",
        "Nada é impossível para Deus — nem os dias difíceis. 🙏",
        "Deus renova as forças dos que nele esperam. 🕊️",
        "Você é mais forte do que imagina, pois Deus caminha contigo.",
        "Confia: o que hoje pesa, amanhã será testemunho. 🌈",
        "Deus já está no amanhã cuidando do que hoje te preocupa.",
        "A fé não elimina os problemas, mas nos sustenta neles. 🤍",
        "O Senhor conhece o teu coração e ouve cada oração silenciosa.",
        "Levanta-te, pois Deus ainda tem planos lindos para você. 🌸",
        "A paz que vem de Deus guarda o coração e a mente.",
        "Mesmo cansada, não desista — Deus vê teu esforço. 🌙",
        "O amor de Deus é maior que qualquer medo.",
        "Descanse: Deus está no controle de tudo. ✨"
    ];

    let indiceVersiculo = 0;

    $(document).on("dblclick", ".footer", function () {
        openPopup(
            "Para você 💚",
            versiculos[indiceVersiculo]
        );

        indiceVersiculo++;

        if (indiceVersiculo >= versiculos.length) {
            indiceVersiculo = 0;
        }
    });

});