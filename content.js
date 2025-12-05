// Google Maps Business Scraper - Content Script

class GoogleMapsScraper {
  constructor() {
    this.running = false;
    this.paused = false;
    this.index = 0;
    this.hasWebsite = [];
    this.noWebsite = [];
    this.processedUrls = new Set();
    this.ui = null;

    // Domains that don't count as real websites
    this.excludedDomains = [
      "facebook.com",
      "fb.com",
      "instagram.com",
      "twitter.com",
      "x.com",
      "ubereats.com",
      "dineplan.com",
      "linkedin.com",
      "youtube.com",
      "tiktok.com",
      "whatsapp.com",
      "telegram.org",
      "snapchat.com",
      "tripadvisor.com",
      "yelp.com",
      "zomato.com",
      "google.com",
    ];
  }

  init() {
    this.createUI();
    this.setupKeyboardShortcut();
    console.log("🗺️ Google Maps Scraper loaded! Click START to begin.");
  }

  createUI() {
    // Floating control panel
    const panel = document.createElement("div");
    panel.id = "gmaps-scraper-panel";
    panel.innerHTML = `
      <div class="scraper-header">
        <h3>🗺️ Maps Scraper</h3>
        <button id="scraper-minimize" title="Minimize">_</button>
      </div>
      <div class="scraper-body">
        <div class="scraper-stats">
          <div class="stat">
            <span class="stat-label">Has Website:</span>
            <span class="stat-value" id="has-website-count">0</span>
          </div>
          <div class="stat">
            <span class="stat-label">No Website:</span>
            <span class="stat-value" id="no-website-count">0</span>
          </div>
          <div class="stat">
            <span class="stat-label">Total:</span>
            <span class="stat-value" id="total-count">0</span>
          </div>
        </div>
        <div class="scraper-status">
          <span id="scraper-status-text">Ready to start</span>
        </div>
        <div class="scraper-controls">
          <button id="scraper-start" class="btn btn-start">START</button>
          <button id="scraper-pause" class="btn btn-pause" disabled>PAUSE</button>
          <button id="scraper-stop" class="btn btn-stop" disabled>STOP</button>
        </div>
        <div class="scraper-downloads">
          <button id="download-has-website" class="btn btn-download" disabled>
            ⬇ Download "Has Website"
          </button>
          <button id="download-no-website" class="btn btn-download" disabled>
            ⬇ Download "No Website"
          </button>
          <button id="download-all" class="btn btn-download" disabled>
            ⬇ Download All Data
          </button>
        </div>
        <div class="scraper-help">
          <small>Shortcut: Ctrl+Shift+S to stop</small>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    this.ui = panel;

    // Event listeners
    document
      .getElementById("scraper-start")
      .addEventListener("click", () => this.start());
    document
      .getElementById("scraper-pause")
      .addEventListener("click", () => this.togglePause());
    document
      .getElementById("scraper-stop")
      .addEventListener("click", () => this.stop());
    document
      .getElementById("scraper-minimize")
      .addEventListener("click", () => this.toggleMinimize());
    document
      .getElementById("download-has-website")
      .addEventListener("click", () =>
        this.downloadJSON(this.hasWebsite, "has-website")
      );
    document
      .getElementById("download-no-website")
      .addEventListener("click", () =>
        this.downloadJSON(this.noWebsite, "no-website")
      );
    document
      .getElementById("download-all")
      .addEventListener("click", () => this.downloadAll());

    this.makeDraggable(panel);
  }

  makeDraggable(element) {
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    const header = element.querySelector(".scraper-header h3");

    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = element.offsetTop - pos2 + "px";
      element.style.left = element.offsetLeft - pos1 + "px";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  toggleMinimize() {
    this.ui.classList.toggle("minimized");
  }

  setupKeyboardShortcut() {
    // Listen for keyboard shortcut from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "stop-scraper") {
        this.stop();
      }
    });
  }

  updateUI() {
    document.getElementById("has-website-count").textContent =
      this.hasWebsite.length;
    document.getElementById("no-website-count").textContent =
      this.noWebsite.length;
    document.getElementById("total-count").textContent =
      this.hasWebsite.length + this.noWebsite.length;

    // Enable download buttons if we have data
    const hasData = this.hasWebsite.length > 0 || this.noWebsite.length > 0;
    document.getElementById("download-has-website").disabled =
      this.hasWebsite.length === 0;
    document.getElementById("download-no-website").disabled =
      this.noWebsite.length === 0;
    document.getElementById("download-all").disabled = !hasData;
  }

  setStatus(text, type = "info") {
    const statusEl = document.getElementById("scraper-status-text");
    statusEl.textContent = text;
    statusEl.className = `status-${type}`;
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getListScrollBox() {
    return (
      document.querySelector(".m6QErb.DxyBCb.kA9KIf.dS8AEf") ||
      document.querySelector('[role="feed"]')
    );
  }

  getItems() {
    return [...document.querySelectorAll(".hfpxzc")].filter((item) => {
      const href = item.getAttribute("href");
      return href && !this.processedUrls.has(href);
    });
  }

  async clickItem(el) {
    const href = el.getAttribute("href");
    if (href) {
      this.processedUrls.add(href);
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    await this.wait(300);
    el.click();
    await this.wait(2000);
  }

  scrapeDetails() {
    // Business name
    const name =
      document.querySelector("h1.DUwDvf")?.textContent?.trim() ||
      document.querySelector("h1")?.textContent?.trim() ||
      "Unknown";

    // Phone number
    const phoneBtn = document.querySelector(
      'button[data-tooltip="Copy phone number"]'
    );
    const phone =
      phoneBtn?.getAttribute("aria-label")?.replace("Phone:", "").trim() ||
      phoneBtn?.textContent?.trim() ||
      null;

    // Email - look ONLY in the business details section, not entire page
    let email = null;
    const detailsPane = document.querySelector(".m6QErb[aria-label]");
    if (detailsPane) {
      const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
      const detailsText = detailsPane.textContent;
      const emailMatches = detailsText.match(emailRegex);

      // Filter out common non-business emails
      if (emailMatches) {
        email =
          emailMatches.find(
            (e) => !e.includes("gmail.com") && !e.includes("google.com")
          ) || null;
      }
    }

    // Address
    const address =
      document.querySelector('[data-item-id="address"]')?.textContent?.trim() ||
      null;

    const authorityLink = document.querySelector('a[data-item-id="authority"]');
    let website = authorityLink?.href || null;

    if (website && !this.isRealWebsite(website)) {
      website = null;
    }

    // Get all links to check for social media
    const socialDomains = [
      "facebook.com",
      "fb.com",
      "instagram.com",
      "twitter.com",
      "x.com",
      "linkedin.com",
      "youtube.com",
      "tiktok.com",
      "whatsapp.com",
      "telegram.com",
      "snapchat.com",
      "facebook.com",
      "ubereats.com",
      "dineplan.com",
      "dining-out.co.za",
      "menunprice.co.za",
      "resto.co.za",
    ];

    const allLinks = [...document.querySelectorAll('a[href^="http"]')].map(
      (a) => a.href
    );

    const socialLinks = allLinks.filter((link) => {
      try {
        const url = new URL(link);
        const domain = url.hostname.toLowerCase();

        return (
          socialDomains.some((social) => domain.includes(social)) &&
          !domain.includes("google.com") &&
          !domain.includes("google.co")
        );
      } catch {
        return false;
      }
    });

    // const socialLinks = allLinks.filter(
    //   (link) =>
    //     socialDomains.some((domain) => link.includes(domain)) &&
    //     !this.isRealWebsite(link) &&
    //     link !== website
    // );

    return {
      name,
      phone,
      email,
      address,
      website: website,
      socialLinks: socialLinks.length > 0 ? socialLinks : null,
      scrapedAt: new Date().toISOString(),
    };
  }

  isRealWebsite(url) {
    if (!url) return false;

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      const fullUrl = url.toLowerCase();

      if (
        domain.includes("google.com") ||
        domain.includes("google.co.za") ||
        domain.includes("google.co.uk") ||
        fullUrl.includes("/viewer/chooseprovider") ||
        fullUrl.includes("google.com/maps") ||
        fullUrl.includes("support.google.com") ||
        fullUrl.includes("accounts.google.com") ||
        fullUrl.includes("business.google.com") ||
        fullUrl.includes("google.com/intl")
      ) {
        return false;
      }

      return !this.excludedDomains.some((excluded) =>
        domain.includes(excluded)
      );
    } catch {
      return false;
    }
  }

  async clickBack() {
    const backBtn =
      document.querySelector('button[aria-label*="Back"]') ||
      document.querySelector('button[jsaction*="pane.back"]');

    if (backBtn) {
      backBtn.click();
      await this.wait(1500);
    }
  }

  async scrollListIfNeeded(items) {
    if (this.index >= items.length - 2) {
      const box = this.getListScrollBox();
      if (box) {
        const oldScrollHeight = box.scrollHeight;
        box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
        await this.wait(2000); // Wait for new items to load

        const newScrollHeight = box.scrollHeight;
        // If scroll height didn't change, we've reached the end
        return newScrollHeight > oldScrollHeight;
      }
    }
    return true;
  }

  async start() {
    if (this.running) return;

    this.running = true;
    this.paused = false;
    this.index = 0;
    this.processedUrls.clear();

    document.getElementById("scraper-start").disabled = true;
    document.getElementById("scraper-pause").disabled = false;
    document.getElementById("scraper-stop").disabled = false;

    this.setStatus("Starting scraper...", "info");
    await this.wait(1500);

    await this.run();
  }

  togglePause() {
    this.paused = !this.paused;
    const pauseBtn = document.getElementById("scraper-pause");

    if (this.paused) {
      pauseBtn.textContent = "RESUME";
      this.setStatus("Paused", "warning");
    } else {
      pauseBtn.textContent = "PAUSE";
      this.setStatus("Running...", "success");
    }
  }

  stop() {
    this.running = false;
    this.paused = false;

    document.getElementById("scraper-start").disabled = false;
    document.getElementById("scraper-pause").disabled = true;
    document.getElementById("scraper-stop").disabled = true;
    document.getElementById("scraper-pause").textContent = "PAUSE";

    this.setStatus(
      `Stopped. Scraped ${
        this.hasWebsite.length + this.noWebsite.length
      } businesses`,
      "info"
    );
    this.updateUI();
  }

  async run() {
    console.log("▶ Scraper started...");

    let consecutiveNoNewItems = 0;

    while (this.running) {
      while (this.paused && this.running) {
        await this.wait(500);
      }

      if (!this.running) break;

      let items = this.getItems();

      // Try to scroll and get more items
      const hasMoreItems = await this.scrollListIfNeeded(items);
      items = this.getItems();

      if (items.length === 0) {
        consecutiveNoNewItems++;

        if (consecutiveNoNewItems >= 5) {
          this.setStatus("No more items found. Finishing...", "warning");
          await this.wait(2000);
          break;
        }

        this.setStatus("Waiting for more items...", "info");
        await this.wait(2000);
        continue;
      }

      consecutiveNoNewItems = 0;
      const item = items[0];

      this.setStatus(
        `Scraping: ${this.index + 1}/${this.processedUrls.size}...`,
        "success"
      );

      try {
        await this.clickItem(item);
        const data = this.scrapeDetails();

        console.log(`✓ Scraped: ${data.name}`);

        if (data.website) {
          this.hasWebsite.push(data);
        } else {
          this.noWebsite.push(data);
        }

        this.updateUI();
        await this.clickBack();

        this.index++;
        await this.wait(1000); // Delay between items
      } catch (error) {
        console.error("Error scraping item:", error);
        await this.clickBack();
        await this.wait(1000);
      }
    }

    this.stop();
    console.log("✔ Scraping finished!");
    console.log("Has website:", this.hasWebsite);
    console.log("No website:", this.noWebsite);
  }

  downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `gmaps-${filename}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.setStatus(`Downloaded ${filename}.json`, "success");
  }

  downloadAll() {
    const allData = {
      hasWebsite: this.hasWebsite,
      noWebsite: this.noWebsite,
      summary: {
        totalScraped: this.hasWebsite.length + this.noWebsite.length,
        withWebsite: this.hasWebsite.length,
        withoutWebsite: this.noWebsite.length,
        scrapedAt: new Date().toISOString(),
      },
    };

    this.downloadJSON(allData, "all-data");
  }
}

// Initialize scraper when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    const scraper = new GoogleMapsScraper();
    scraper.init();
    window.gmapsScraper = scraper; // Make accessible in console for debugging
  });
} else {
  const scraper = new GoogleMapsScraper();
  scraper.init();
  window.gmapsScraper = scraper;
}
