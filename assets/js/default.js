// ======================================================================
// BLOCO 0: CONFIGURAÇÕES GLOBAIS
// ======================================================================

let titleText = $("title").text();

window.App = window.App || {};
App.state = App.state || { blockUnload: false };

$(window).on("beforeunload", function (e) {
    if (App.state.blockUnload) {
        const message = "Há processos em andamento. Você realmente deseja sair?";
        e.preventDefault();
        e.returnValue = message;
        return message;
    }
});

let loadingImg = new Image();
loadingImg.src = "https://www.4ourjourney.com/assets/img/loading.gif";

// ======================================================================
// BLOCO 1: Stop Loading e Scroll Reveal
// ======================================================================

function hideLoading() {
    const $loading = $(".loading");
    if ($loading.is(":visible")) $loading.stop(true, false).fadeOut(150);
    revealOnScroll();
    checkCookie();
}

function revealOnScroll() {
    const windowBottom = $(window).scrollTop() + $(window).height();
    $(".scroll-reveal").each(function () {
        if ($(this).offset().top < windowBottom) $(this).addClass("visible");
    });
}

// ======================================================================
// BLOCO 2: Popup
// ======================================================================

function openPopup(title, content) {
    $(".popup-header-count").html(title ? $.trim(title) : "Notificação");
    $(".popup-count").html(`<div class="flex-center-center"><img width="38" height="38" src="${loadingImg.src}"></div>`);
    $(".popup-wallpaper, .popup").fadeIn(150);
    if (content) $(".popup-count").html($.trim(content));
}

function closePopup() {
    if (App.state.blockUnload) return;
    $(".popup-wallpaper, .popup").fadeOut(150, function () {
        $(".popup-header-count").html("");
        $(".popup-count").html("");
    });
}

$(document).on("keydown", function (e) {
    if (e.key === "Escape" && $(".popup-wallpaper, .popup").is(":visible")) closePopup();
});

// ======================================================================
// BLOCO 3: Sistema de Cookie
// ======================================================================

function getCookieKey() {
    return location.hostname.replace(/^www\./, "") + "-cookie";
}

function acceptCookie() {
    try {
        localStorage.setItem(getCookieKey(), "True");
        $(".content-cookie").fadeOut(150, function () { $(this).remove(); });
    } catch (e) {
        console.log("Erro ao salvar cookie:", e);
    }
}

function checkCookie() {
    if (!localStorage.getItem(getCookieKey())) $(".content-cookie").fadeIn(150);
}

// ======================================================================
// BLOCO 4: Sistema de Tradução (MULTI-IDIOMA)
// ======================================================================

function getInitialLanguage() {
    const saved = localStorage.getItem("lang");
    if (saved && translations[saved]) return saved;

    const browser = (navigator.language || "en").split("-")[0];
    if (translations[browser]) return browser;

    return "en";
}

function applyTranslationInstant(lang) {
    if (!translations || !translations[lang]) return;
    $.each(translations[lang], function (key, value) {
        $(`[id="${key}"], .${key}`).each(function () {
            if ($(this).is("input, textarea, select")) $(this).attr("placeholder", value);
            else $(this).html(value);
        });
    });
}

function applyTranslationWithFade(lang) {
    if (!translations || !translations[lang]) return;
    $.each(translations[lang], function (key, value) {
        $(`[id="${key}"], .${key}`).each(function () {
            const $el = $(this);
            if ($el.is("input, textarea, select")) {
                $el.attr("placeholder", value);
            } else if ($el.is(":visible")) {
                $el.fadeOut(150, function () { $el.html(value).fadeIn(150); });
            } else {
                $el.html(value);
            }
        });
    });
}

function initLanguageSelect() {
    const $select = $("#lang-select");
    if (!$select.length) return;

    const lang = getInitialLanguage();
    $select.val(lang);

    $select.on("change", function () {
        const selected = $(this).val();
        if (!translations[selected]) return;
        localStorage.setItem("lang", selected);
        applyTranslationWithFade(selected);
    });
}

function initTranslationSystem() {
    const lang = getInitialLanguage();
    localStorage.setItem("lang", lang);
    applyTranslationInstant(lang);
    initLanguageSelect();
}

// --- Traduz HTML dinâmico (strings renderizadas via JS)
window.translateHTML = function (html, lang) {
    if (!window.translations || !translations[lang]) return html;

    const $temp = $("<div>").html(html);

    // Tradução por ID
    $temp.find("[id]").each(function () {
        const id = $(this).attr("id");
        if (translations[lang][id]) {
            if ($(this).is("input, textarea, select")) {
                $(this).attr("placeholder", translations[lang][id]);
            } else {
                $(this).html(translations[lang][id]);
            }
        }
    });

    return $temp.html();
};

// --- Facilitador de tradução para elementos dinâmicos  ---
function renderAndTranslate(container, html){
    $(container).html(html);
    applyTranslationInstant(localStorage.getItem("lang") || "en");
}

// --- Facilitador de tradução para elementos dinâmicos com efeito fadeIn ---
function renderAndTranslateFadeIn(container, html){
    const $container = $(container);

    if ($container.is(":animated")) return;

    $container.fadeOut(150, function () {
        $container
            .html(html)
            .css({ transform: "translateY(10px)", opacity: 0 })
            .fadeIn(0)
            .animate(
                { opacity: 1 },
                {
                    duration: 150,
                    step: function () {
                        $container.css("transform", "translateY(0)");
                    }
                }
            );

        applyTranslationInstant(localStorage.getItem("lang") || "en");
    });
}

// ======================================================================
// BLOCO 5: Document Ready
// ======================================================================

$(document).ready(function () {

    hideLoading();
    initTranslationSystem();

    $(window).on("scroll", revealOnScroll);
    revealOnScroll();

    window.openPopup = openPopup;
    window.closePopup = closePopup;

    $(document).on("click", function (e) {
        if (
            $(e.target).closest(".popup-btn-close").length ||
            $(e.target).closest(".popup-wallpaper").length ||
            $(e.target).closest("#btn-recuse").length
        ) closePopup();
    });

    $("#click-btn-cookie").on("click", function () { acceptCookie(); });
});

$(window).on("load pageshow", hideLoading);
setTimeout(hideLoading, 3000);
