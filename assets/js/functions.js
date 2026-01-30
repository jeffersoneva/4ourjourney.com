// ======================================================================
// Bloco 0: CONFIGURAÇÕES GLOBAIS
// ======================================================================

// -- Mapeamento do diretorio atual
const dirs = ["ebook", "ebooks"];
const mustGoBack = dirs.some(dir => window.location.pathname.includes(`/${dir}/`));
const basePath = mustGoBack ? "../" : "./";

// --- Controle de login do usuário ---
let inLog = false;

// ======================================================================
// Bloco 1: RENDERIZAÇÃO DE ELEMENTOS DINÂMICOS
// ======================================================================

// --- Renderiza o formulário de cadastro ---
function renderCadastro(){
    return `<form class="forms" id="form-cadastro">
    <h2 id="fc-h2">CADASTRO</h2>
        <input type="text" name="nome-1" placeholder="Seu nome" maxlength="30" id="fc-name-1" required>
        <input type="text" name="nome-2" placeholder="Nome do(a) conjugue" maxlength="30" id="fc-name-2" required>
        <input type="email" name="email" placeholder="Seu melhor email" maxlength="50" id="fc-email" required>
        <input type="password" name="pass" placeholder="Crie uma senha" maxlength="40" id="fc-senha" required>
        <input type="password" name="re-pass" placeholder="Redigite sua senha" maxlength="40" id="fc-resenha" required>
        <button type="submit" class="txt-small"><span id="fc-submit">Entrar</span></button>
        <span class="form-footer-link txt-small txt-center" id="fc-footer">Já poussi conta? <a href='#' class='form-login'>Entrar</a></span>
       <div class="form-return-messagem txt-small flex-center-center"></div>
    </form>`;
}

// --- Renderiza o formulário de login ---
function renderLogin(){
    return `<form class="forms" id="form-login">
        <h2 id="fl-h2">ENTRAR</h2>
        <input type="email" name="email" class="format-email-login" id="fl-email" placeholder="Seu email" maxlength="50" required>
        <input type="password" name="pass" class="format-password-login" id="fl-senha" placeholder="Digite sua senha" maxlength="40" required>
        <button type="submit" class="txt-small"><span id="fl-submit">Entrar</span></button>
        <span class="form-footer-link txt-small txt-center" id="fl-footer">Ainda não tem uma conta? <a href='#' class='form-cadastro'>Cadastrar</a></span>
        <div class="form-return-messagem txt-small flex-center-center"></div>
    </form>`;
}

// --- Alterna entre formulários de login e cadastro
$(document).on("click", ".form-login", function (e) {
    e.preventDefault()
    renderAndTranslateFadeIn(".auth-right", renderLogin());
});

$(document).on("click", ".form-cadastro", function (e) {
    e.preventDefault()
    renderAndTranslateFadeIn(".auth-right", renderCadastro());
});


// ======================================================================
// Bloco 2: Sistemas de login e cadastro do usuário
// ======================================================================

// --- Verificador de inputs com erros
function verifyAllInputs(){
    return $(".input-error").length === 0;
}

// --- Formata inputs de login
function formatInputsLogin(){

    // --- Email ---
    $(document).on("keyup", ".format-email-login", function () {
        const input = $(this);
        const value = input.val().trim();
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

        if (!emailValido && value.length > 0) {
            input
                .addClass("input-error")
                .css({ border: "1px solid var(--quinary-3)" });
        } else {
            input
                .removeClass("input-error")
                .css({ border: "1px solid var(--light-4)" });
        }
    });

    // --- Senha ---
    $(document).on("keyup", ".format-password-login", function () {
        const input = $(this);
        const value = input.val();
        if (value.length > 0 && value.length < 7) {
            input
                .addClass("input-error")
                .css({ border: "1px solid var(--quinary-3)" });
        } else {
            input
                .removeClass("input-error")
                .css({ border: "1px solid var(--light-4)" });
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

$(document).ready(function () {

    renderAndTranslate(".auth-right", renderLogin());

});