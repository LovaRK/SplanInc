(function () {
  const page = document.body.dataset.page || "home";

  const nav = [
    ["/", "Home", "home"],
    ["/about", "About", "about"],
    ["/services", "Services", "services"],
    ["/solutions", "Solutions", "solutions"],
    ["/industries", "Industries", "industries"],
    ["/ai-for-oracle", "AI for Oracle", "ai-for-oracle"],
    ["/contact", "Contact", "contact"],
  ];

  const headerRoot = document.getElementById("site-header");
  if (headerRoot) {
    headerRoot.innerHTML = `
      <header class="site-header">
        <div class="container wrap">
          <a href="/" class="brand brand-lockup" aria-label="Splan home">
            <img
              class="brand-lockup-image"
              src="/assets/logos/splan_logo_horizontal_lockup.png"
              alt="Splan Oracle and AI Transformation"
            />
          </a>
          <nav class="nav-links" aria-label="Primary">
            ${nav
              .map(
                ([href, label, key]) =>
                  `<a class="nav-link ${page === key ? "is-active" : ""}" href="${href}">${label}</a>`
              )
              .join("")}
          </nav>
          <button
            class="mobile-toggle"
            type="button"
            aria-expanded="false"
            aria-controls="mobile-panel"
            data-mobile-toggle
          >
            Menu
          </button>
          <div class="nav-actions">
            <a href="/contact" class="btn btn-secondary">Book a Discovery Call</a>
            <a href="/services" class="btn btn-primary">Explore Oracle Services</a>
          </div>
        </div>
        <div class="container mobile-panel" id="mobile-panel" data-mobile-panel>
          <nav class="mobile-links" aria-label="Mobile Primary">
            ${nav.map(([href, label]) => `<a class="mobile-link" href="${href}">${label}</a>`).join("")}
          </nav>
          <div class="mobile-actions">
            <a href="/contact" class="btn btn-secondary">Book a Discovery Call</a>
            <a href="/services" class="btn btn-primary">Explore Oracle Services</a>
          </div>
        </div>
      </header>
    `;
  }

  const footerRoot = document.getElementById("site-footer");
  if (footerRoot) {
    footerRoot.innerHTML = `
      <footer>
        <div class="container footer-grid">
          <section>
            <div class="brand" style="font-size:1.08rem;">Splan Inc.</div>
            <p style="margin-top:.6rem;max-width:40ch;">Oracle Cloud and Oracle EBS consulting for ERP, SCM, procurement, planning, logistics, integrations, and AI-enabled enterprise workflows.</p>
            <p style="margin-top:.8rem;">NY, U.S.A.</p>
            <p style="margin-top:.35rem;"><a href="mailto:info@splaninc.com">info@splaninc.com</a></p>
            <p style="margin-top:.25rem;"><a href="mailto:recruitment@splaninc.com">recruitment@splaninc.com</a></p>
          </section>
          <section>
            <div class="footer-title">Services</div>
            <div class="footer-links">
              <a href="/services">Oracle ERP &amp; SCM Delivery</a>
              <a href="/services">Oracle Procurement &amp; Planning</a>
              <a href="/services">Oracle OTM / GTM / WMS</a>
              <a href="/services">Oracle EBS Modernization</a>
            </div>
          </section>
          <section>
            <div class="footer-title">Solutions</div>
            <div class="footer-links">
              <a href="/solutions">Oracle Integration / OIC</a>
              <a href="/solutions">Oracle Redwood UX</a>
              <a href="/ai-for-oracle">AI Agents for Oracle</a>
              <a href="/industries">Industry Programs</a>
            </div>
          </section>
          <section>
            <div class="footer-title">Company</div>
            <div class="footer-links">
              <a href="/about">About</a>
              <a href="/contact">Request an Oracle Assessment</a>
              <a href="/contact">Project Inquiries</a>
              <a href="/contact">Recruitment</a>
            </div>
          </section>
        </div>
        <div class="container footer-bottom">
          <span>© 2026 Splan Inc. Cognitive Precision Engineering.</span>
          <span class="mono" style="color:#9cefff">ORACLE CLOUD + EBS + AI-ENABLED TRANSFORMATION</span>
        </div>
      </footer>
    `;
  }

  function setStatus(el, message, isError) {
    if (!el) return;
    el.textContent = message;
    el.style.color = isError ? "var(--error)" : "var(--ok)";
  }

  function getAttribution() {
    const params = new URLSearchParams(window.location.search);
    const get = (key) => (params.get(key) || "").trim();

    return {
      utm_source: get("utm_source"),
      utm_medium: get("utm_medium"),
      utm_campaign: get("utm_campaign"),
      referrer: document.referrer || "direct",
    };
  }

  function ensureHiddenInput(form, name, value) {
    let input = form.querySelector(`input[name='${name}']`);
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      form.appendChild(input);
    }
    input.value = value;
  }

  function applyAttributionToForms() {
    const attribution = getAttribution();
    document.querySelectorAll("[data-lead-form]").forEach((form) => {
      ensureHiddenInput(form, "utm_source", attribution.utm_source);
      ensureHiddenInput(form, "utm_medium", attribution.utm_medium);
      ensureHiddenInput(form, "utm_campaign", attribution.utm_campaign);
      ensureHiddenInput(form, "referrer", attribution.referrer);
    });
  }

  applyAttributionToForms();

  document.querySelectorAll("[data-lead-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const statusEl = form.querySelector("[data-form-status]");
      const submitBtn = form.querySelector("button[type='submit']");
      setStatus(statusEl, "Submitting request...", false);
      submitBtn.disabled = true;

      const payload = Object.fromEntries(new FormData(form).entries());

      try {
        const response = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to submit request");

        setStatus(
          statusEl,
          "Thanks. A senior Oracle specialist will respond within one business day.",
          false
        );
        form.reset();
        applyAttributionToForms();
      } catch (error) {
        setStatus(statusEl, error.message || "Submission failed", true);
      } finally {
        submitBtn.disabled = false;
      }
    });
  });

  document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const statusEl = form.parentElement.querySelector("[data-newsletter-status]");
      setStatus(statusEl, "Subscribing...", false);

      const email = form.querySelector("input[name='email']")?.value || "";

      try {
        const response = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Subscription failed");
        setStatus(statusEl, data.message || "Subscribed", false);
        form.reset();
      } catch (error) {
        setStatus(statusEl, error.message || "Subscription failed", true);
      }
    });
  });

  const devTabs = document.querySelectorAll(".dev-tab");
  if (devTabs.length) {
    devTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.devTarget;
        devTabs.forEach((t) => t.classList.remove("is-active"));
        document
          .querySelectorAll(".dev-panel")
          .forEach((panel) => panel.classList.remove("is-active"));
        tab.classList.add("is-active");
        document
          .querySelector(`.dev-panel[data-dev-panel='${target}']`)
          ?.classList.add("is-active");
      });
    });
  }

  const mobileToggle = document.querySelector("[data-mobile-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");
  if (mobileToggle && mobilePanel) {
    const closePanel = () => {
      mobilePanel.classList.remove("is-open");
      mobileToggle.setAttribute("aria-expanded", "false");
    };

    mobileToggle.addEventListener("click", () => {
      const isOpen = mobilePanel.classList.toggle("is-open");
      mobileToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mobilePanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closePanel);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1020) closePanel();
    });
  }

  const hoverCapable = window.matchMedia("(hover: hover)").matches;
  if (hoverCapable) {
    const interactive = document.querySelectorAll(".card, .hero-video");
    interactive.forEach((node) => {
      node.addEventListener("pointermove", (event) => {
        const rect = node.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        node.style.setProperty("--mx", `${x}%`);
        node.style.setProperty("--my", `${y}%`);
      });
    });
  }

  function addAutoplayToIframe(shell) {
    const frame = shell?.querySelector("iframe");
    if (!frame) return;
    if (frame.src.includes("autoplay=1")) return;
    const separator = frame.src.includes("?") ? "&" : "?";
    frame.src = `${frame.src}${separator}autoplay=1`;
  }

  document.querySelectorAll("[data-video-play]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-video-play");
      const shell = document.getElementById(targetId);
      if (!shell) return;
      addAutoplayToIframe(shell);
      shell.classList.remove("is-playing");
      void shell.offsetWidth;
      shell.classList.add("is-playing");
    });
  });

  document.querySelectorAll("[data-video-fullscreen]").forEach((button) => {
    button.addEventListener("click", async () => {
      const targetId = button.getAttribute("data-video-fullscreen");
      const shell = document.getElementById(targetId);
      if (!shell) return;

      addAutoplayToIframe(shell);
      shell.classList.remove("is-playing");
      void shell.offsetWidth;
      shell.classList.add("is-playing");

      try {
        if (document.fullscreenElement === shell) {
          await document.exitFullscreen();
          return;
        }
        await shell.requestFullscreen();
      } catch (_error) {
        // Fullscreen may be blocked by browser settings.
      }
    });
  });

  document.addEventListener("fullscreenchange", () => {
    const active = document.fullscreenElement;
    document.querySelectorAll("[data-video-shell]").forEach((shell) => {
      const isFs = active === shell;
      shell.classList.toggle("is-fullscreen", isFs);
    });

    document.querySelectorAll("[data-video-fullscreen]").forEach((button) => {
      const targetId = button.getAttribute("data-video-fullscreen");
      const shell = document.getElementById(targetId);
      button.textContent = document.fullscreenElement === shell ? "Exit Fullscreen" : "Fullscreen";
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(".reveal").forEach((el, index) => {
    const delay = Math.min((index % 6) * 0.07, 0.35);
    el.style.transitionDelay = `${delay}s`;
    observer.observe(el);
  });
})();
