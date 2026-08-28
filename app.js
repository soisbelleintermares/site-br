(() => {
  "use strict";
  function iniciarSite() {
    const config = window.CLIENTE_CONFIG || {};
    const normalizarUrl = (valor) => {
      const texto = String(valor || "").trim();
      if (!texto || /^x+$/i.test(texto)) return "";
      return /^https?:\/\//i.test(texto) ? texto : `https://${texto}`;
    };
    const configurarLink = (nome, href) => {
      const el = document.querySelector(`[data-link="${nome}"]`);
      if (!el) return;
      if (!href) {
        el.removeAttribute("href");
        el.setAttribute("aria-disabled","true");
        return;
      }
      el.href = href;
      el.removeAttribute("aria-disabled");
    };

    configurarLink("agendar", normalizarUrl(config.agendar));
    const numero = String(config.whatsappNumero || "").replace(/\D/g,"");
    if (numero) {
      const msg = encodeURIComponent(config.whatsappMensagem || "");
      configurarLink("whatsapp", `https://wa.me/${numero}${msg ? `?text=${msg}` : ""}`);
    }
    configurarLink("procedimentos", normalizarUrl(config.procedimentos));
    configurarLink("localizacao", normalizarUrl(config.localizacao));
    configurarLink("produtos", normalizarUrl(config.produtos));
    configurarLink("instagram", normalizarUrl(config.instagram));

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.error), {once:true});
    }

    let installPrompt = null;
    const installButton = document.getElementById("installApp");
    const modal = document.getElementById("iosInstallModal");
    const close = document.getElementById("closeIosInstall");
    const title = document.getElementById("iosInstallTitle");
    const instructions = document.getElementById("installInstructions");
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    const mobile = matchMedia("(pointer: coarse)").matches || matchMedia("(max-width: 1024px)").matches;
    if (mobile && !isStandalone && installButton) installButton.hidden = false;

    window.addEventListener("beforeinstallprompt", e => {
      e.preventDefault(); installPrompt = e;
      if (installButton) installButton.hidden = false;
    });

    installButton?.addEventListener("click", async () => {
      if (installPrompt) {
        await installPrompt.prompt(); await installPrompt.userChoice;
        installPrompt = null; installButton.hidden = true; return;
      }
      if (title && instructions) {
        title.textContent = isIos ? "Instalar no iPhone ou iPad" : "Instalar no celular";
        instructions.innerHTML = isIos
          ? "<p>No Safari: Compartilhar → Adicionar à Tela de Início → Adicionar.</p>"
          : "<p>No Chrome: menu ⋮ → Instalar aplicativo ou Adicionar à tela inicial.</p>";
      }
      if (modal) modal.hidden = false;
    });
    close?.addEventListener("click",()=>modal.hidden=true);
    modal?.addEventListener("click",e=>{ if(e.target===modal) modal.hidden=true; });
    window.addEventListener("appinstalled",()=>{installPrompt=null;if(installButton)installButton.hidden=true;});
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", iniciarSite, {once:true})
    : iniciarSite();
})();
