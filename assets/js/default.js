// ======================================================================
// Bloco 0: CONFIGURAÇÕES GLOBAIS
// ======================================================================

// --- Texto do título do site ---
let titleText = $("title").text();

// --- Controladores do bloco Canvas Nodes --
const isMobile = window.matchMedia("(max-width: 960px)").matches;
const config = {
    logoSpeed: isMobile ? 30 : 50,
    nodeCount: isMobile ? 30 : 60,
    maxNodeDistance: isMobile ? 120 : 200
};

// --- Controle de ação (aviso ao fechar janela) ---
window.App = window.App || {};

App.state = App.state || {
    blockUnload: false
};

$(window).on('beforeunload', function(e) {
    if (App.state.blockUnload) {
        const message = "Há processos em andamento. Você realmente deseja sair?";
        e.preventDefault();
        e.returnValue = message;
        return message;
    }
});

// --- Imagem de loading ---
let loadingImg = new Image();
loadingImg.src = 'https://www.jeffersoneva.com/assets/img/loading.gif';

// ============================================================
// BLOCO 1: Stop Loading e Verificação de Cookie
// ============================================================

function hideLoading() {
    const $loading = $(".loading");
    if ($loading.is(":visible")) {
        $loading.stop(true, false).fadeOut(200);
    }
    revealOnScroll();
    checkCookie();
}

// ============================================================
// BLOCO 1: Scroll Reveal
// ============================================================

// --- Efeito de fade com upper nos elementos ---
function revealOnScroll() {
    const offsetTrigger = 0;
    const windowBottom = $(window).scrollTop() + $(window).height();
    $(".scroll-reveal").each(function () {
        const elementTop = $(this).offset().top;
        if (elementTop < windowBottom - offsetTrigger) {
            $(this).addClass("visible");
        }
    });
}

// ============================================================
// BLOCO 2: Popup
// ============================================================

// --- Aplica elemento de titulo e content no popup ---
function openPopup(title, content) {
    $(".popup-header-count").html(title ? $.trim(title) : "Notificação");
    $(".popup-count").html(`
        <div class="flex-center-center">
            <img width="38" height="38" src="${loadingImg.src}" alt="Carregando">
        </div>
    `);
    $(".popup-wallpaper, .popup").fadeIn(100);
    if (content) {
        $(".popup-count").html($.trim(content));
    }
}

// --- Fecha o popup e limpa seu conteúdo ---
function closePopup() {
    if (App.state.blockUnload) return;
    $(".popup-wallpaper, .popup").fadeOut(100, function () {
        $(".popup-header-count").html("");
        $(".popup-count").html("");
    });
}

// --- Fecha popup com ESC ---
$(document).on("keydown", function (e) {
    if (e.key === "Escape") {
        if ($(".popup-wallpaper, .popup").is(":visible")) {
            closePopup()
        }
    }
});

// ============================================================
// BLOCO 3: Sistema de cookie
// ============================================================

// --- Tenta armazenar a aceitação do aviso de cookie ---
function acceptCookie(){
    try {
        const cookieKey = getCookieKey();
        localStorage.setItem(cookieKey, "True");

        const $contentCookie = $(".content-cookie");
        if ($contentCookie.length) {
            $contentCookie.css("overflow", "hidden").fadeOut(200, function () {
                $(this).remove();
            });
        }
        const $alterLang = $(".alter-language");
        if ($alterLang.length) {
            const isMobile = window.matchMedia("(max-width:960px)").matches;
            const newBottom = isMobile ? 10 : 20;
            $alterLang.css({
                transition: "bottom 0.4s ease",
                bottom: newBottom + "px"
            });
        }
    } catch (e) {
        console.log("Erro ao salvar dado no LocalStorage para aviso de cookies: ", e);
    }
}

// --- Verifica se cookie existe e o exibe ---
function checkCookie(){
    const cookieKey = getCookieKey();
    if (!localStorage.getItem(cookieKey)) {
        const $contentCookie = $(".content-cookie");
        if ($contentCookie.length) {
            $contentCookie.fadeIn(200);
        }
    }
}

// ======================================================================
// BLOCO 4: Canvas Nodes
// ======================================================================

function initCanvasNodes() {
    const canvas = document.getElementById("header-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height, nodes = [];
    function resizeCanvas() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    for (let i = 0; i < config.nodeCount; i++) {
        nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.5) * 1.2,
            radius: 2 + Math.random() * 2
        });
    }
    function animate() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                let dx = nodes[i].x - nodes[j].x;
                let dy = nodes[i].y - nodes[j].y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < config.maxNodeDistance) {
                    ctx.strokeStyle = `rgba(26,28,42,${1 - dist / config.maxNodeDistance})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }
        nodes.forEach(n => {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > width) n.vx *= -1;
            if (n.y < 0 || n.y > height) n.vy *= -1;
            ctx.fillStyle = 'rgba(26,28,42,1)';
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    $(window).on("resize", resizeCanvas);
    animate();
}
// ======================================================================
// BLOCO 5: Função de Tradução Dinâmica
// ======================================================================

// --- Inicializador do sistema de tradução ---
function initTranslationSystem() {
    const savedLang = localStorage.getItem("lang") || "pt";
    const $langToggle = $("#lang-toggle");
    if ($langToggle.length) {
        $langToggle.prop("checked", savedLang === "en");

        $langToggle.on("change", function () {
            const lang = $(this).is(":checked") ? "en" : "pt";

            localStorage.setItem("lang", lang); // sobrescreve
            applyTranslationWithFade(lang);
        });
    }
    applyTranslationInstant(savedLang);
}


// --- Traduza string HTML (IDs + placeholders) de acordo com idioma ---
function translateHTML(html, lang) {
    if (!translations[lang]) return html;
    const $temp = $("<div>").html(html);
    $temp.find("[id]").each(function () {
        const id = $(this).attr("id");
        if (translations[lang][id]) $(this).html(translations[lang][id]);
    });
    $temp.find("input, textarea, select").each(function () {
        const id = $(this).attr("id");
        if (translations[lang][id]) $(this).attr("placeholder", translations[lang][id]);
    });
    return $temp.html();
}

// --- Traduza elementos visíveis e atualiza texto ou placeholder com fade ---
function applyTranslationWithFade(lang) {
    if (!translations[lang]) return;
    $.each(translations[lang], function (key, value) {
        $(`[id="${key}"], .${key}`).each(function () {
            const $el = $(this);
            if ($el.is("input, textarea, select")) {
                $el.attr("placeholder", value);
            } else {
                if ($el.is(":visible")) {
                    $el.fadeOut(150, function () {
                        $el.html(value).fadeIn(50);
                    });
                } else {
                    $el.html(value);
                }
            }
        });
    });
}

// --- Tradução instantânea: substitui texto e placeholders sem animação ---
function applyTranslationInstant(lang) {

    if (typeof translations === 'undefined') {
        return;
    }
    
    if (!translations[lang]) return;
    $.each(translations[lang], function (key, value) {
        $(`[id="${key}"], .${key}`).each(function () {
            const $el = $(this);
            if ($el.is("input, textarea, select")) {
                $el.attr("placeholder", value);
            } else {
                $el.html(value);
            }
        });
    });
}

// --- Detecta idioma do navegador e traduz de acordo (Se PT, deixa em portugues, se qualquer outro idioma, deixa em EN) ---
function detectLanguageByBrowser() {
    if (localStorage.getItem("lang")) {
        return; // usuário já escolheu idioma antes
    }

    const browserLang = navigator.language || navigator.userLanguage;
    const lang = browserLang.startsWith("pt") ? "pt" : "en";

    localStorage.setItem("lang", lang);
    applyTranslationInstant(lang);

    const $langToggle = $("#lang-toggle");
    if ($langToggle.length) {
        $langToggle.prop("checked", lang === "en");
    }
}

// ======================================================================
// BLOCO 6: Ajuste dinâmico do botão de idioma
// ======================================================================

// ---  Função auxiliar: retorna chave única de cookie baseada no domínio ---
function getCookieKey() {
    return location.hostname.replace(/^www\./, "") + "-cookie";
}

// --- Ajuste dinâmico do botão de idioma ---
function updateAlterLanguageBottom() {
    const $alterLang = $(".alter-language");
    if (!$alterLang.length) return;
    const cookieAccepted = !!localStorage.getItem(getCookieKey());
    const isMobile = window.matchMedia("(max-width:960px)").matches;
    if (cookieAccepted) {
        $alterLang.css("bottom", (isMobile ? 10 : 20) + "px");
        return;
    }
    const $cookie = $(".content-cookie");
    if ($cookie.is(":visible")) {
        const footerHeight = $(".footer").outerHeight() || 0;
        $alterLang.css("bottom", `calc(${footerHeight}px + 1rem)`);
    }
}

// ============================================================
// BLOCO 7: Document Ready (somente globais)
// ============================================================

$(document).ready(function () {

    hideLoading();

    detectLanguageByBrowser();

    // BLOCO 1: Scroll Reveal
    $(window).on("scroll", revealOnScroll);
    revealOnScroll();

    // BLOCO 2: Popup
    window.openPopup = openPopup;
    window.closePopup = closePopup;
    $(document).on("click", function (e) {
        if(
            $(e.target).closest(".popup-btn-close").length ||
            $(e.target).closest(".popup-wallpaper").length ||
            $(e.target).closest("#btn-recuse").length
        ){
            closePopup();
        }
    });

    // BLOCO 3: Sistema de cookie - Tenta armazenar a aceitação do aviso de cookie
    $("#click-btn-cookie").on("click", function () {
        acceptCookie()
    });

    // BLOCO 4: Canvas Nodes
    initCanvasNodes()

    // BLOCO 5: Função de Tradução Dinâmica
    initTranslationSystem();

    // BLOCO 6: Ajuste dinâmico do botão de idioma
    $(window).on("load resize", updateAlterLanguageBottom);
    updateAlterLanguageBottom();

});

$(window).on("load pageshow", function () {
    hideLoading();
});

// Fallback definitivo
setTimeout(function () {
    hideLoading();
}, 3000);
