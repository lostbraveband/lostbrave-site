// Shared helpers for the Lost Brave site. You shouldn't need to edit this file.
(function () {
  "use strict";
  var LB = window.LB = {};
  var BASE = window.BASE || "";
  LB.IMG_EXT = /\.(jpe?g|png|webp|gif|avif|svg)$/i;
  LB.MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  LB.DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  LB.$ = function (id) { return document.getElementById(id); };

  LB.el = function (tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  LB.getText = function (path) {
    return fetch(BASE + path, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(path + " " + r.status);
      return r.text();
    });
  };

  // CSV parser that handles "quoted, values" and blank lines.
  LB.parseCSV = function (text) {
    var rows = [], row = [], field = "", q = false;
    text = text.replace(/^﻿/, "");
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
        else field += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    rows = rows.filter(function (r) { return r.some(function (v) { return v.trim() !== ""; }); });
    if (!rows.length) return [];
    var head = rows.shift().map(function (h) { return h.trim().toLowerCase(); });
    return rows.map(function (r) {
      var o = {};
      head.forEach(function (h, j) { o[h] = (r[j] || "").trim(); });
      return o;
    });
  };

  LB.csv = function (path) { return LB.getText(path).then(LB.parseCSV).catch(function () { return []; }); };
  LB.text = function (path) { return LB.getText(path).catch(function () { return ""; }); };

  LB.safeUrl = function (u) {
    if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
    if (/^[^\s@]+@[^\s@]+$/.test(u)) return "mailto:" + u;
    return "https://" + u;
  };

  LB.paragraphs = function (target, text) {
    text.split(/\n\s*\n/).forEach(function (p) { if (p.trim()) target.appendChild(LB.el("p", null, p.trim())); });
  };

  // ----- Links (links.csv) -----
  LB.links = function () {
    return LB.csv("content/links.csv").then(function (rows) {
      var out = { all: rows.filter(function (r) { return r.url; }) };
      out.find = function (label) {
        label = label.toLowerCase();
        for (var i = 0; i < out.all.length; i++) if (out.all[i].label.toLowerCase() === label) return LB.safeUrl(out.all[i].url);
        return null;
      };
      return out;
    });
  };

  // A "message us" link for Instagram / Facebook, opening a DM where possible.
  LB.messageUrl = function (profileUrl) {
    if (!profileUrl) return null;
    var m = /instagram\.com\/([^/?#]+)/i.exec(profileUrl);
    if (m) return "https://ig.me/m/" + m[1];
    m = /facebook\.com\/profile\.php\?id=(\d+)/i.exec(profileUrl) || /facebook\.com\/(?!profile\.php)([^/?#]+)/i.exec(profileUrl);
    if (m) return "https://m.me/" + m[1];
    return profileUrl;
  };

  LB.icon = function (name) {
    var paths = {
      instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.3" fill="currentColor"/>',
      facebook: '<path fill="currentColor" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z"/>',
      youtube: '<path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z"/>',
      mail: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 6.5 12 13l8.5-6.5" fill="none" stroke="currentColor" stroke-width="2"/>'
    };
    return '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' + (paths[name] || "") + "</svg>";
  };

  // ----- Shows -----
  LB.parseDate = function (s) {
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
    if (m) return new Date(+m[3], +m[1] - 1, +m[2]);
    return null;
  };
  LB.shows = function () {
    return LB.csv("content/shows.csv").then(function (rows) {
      var today = new Date(); today.setHours(0, 0, 0, 0);
      var all = rows.map(function (r) { r._d = LB.parseDate(r.date); return r; }).filter(function (r) { return r._d; });
      return {
        upcoming: all.filter(function (s) { return s._d >= today; }).sort(function (a, b) { return a._d - b._d; }),
        past: all.filter(function (s) { return s._d < today; }).sort(function (a, b) { return b._d - a._d; })
      };
    });
  };
  LB.dateParts = function (d) {
    return { dow: LB.DAYS[d.getDay()], mon: LB.MONTHS[d.getMonth()], day: d.getDate(), year: d.getFullYear() };
  };

  // ----- Folder listing (reads a folder in your GitHub repository) -----
  LB.listFolder = function (folder) {
    var cfg = window.SITE || {};
    if (!cfg.githubUser || /YOUR-GITHUB/.test(cfg.githubUser)) return Promise.resolve([]);
    var api = "https://api.github.com/repos/" + cfg.githubUser + "/" + cfg.githubRepo + "/contents/" + folder;
    return fetch(api).then(function (r) { return r.ok ? r.json() : []; })
      .then(function (list) {
        return (Array.isArray(list) ? list : [])
          .filter(function (f) { return f.type === "file" && !/^readme/i.test(f.name) && f.name.charAt(0) !== "."; })
          .sort(function (a, b) { return b.name.localeCompare(a.name); })
          .map(function (f) { return { name: f.name, path: folder + "/" + encodeURIComponent(f.name), size: f.size, isImage: LB.IMG_EXT.test(f.name) }; });
      }).catch(function () { return []; });
  };

  // File name to caption: "01-live-at-linnemans-nov-2026.jpg" -> "Live at Linnemans Nov 2026"
  var SMALL = /^(a|an|and|at|by|for|from|in|of|on|or|the|to|with)$/;
  LB.captionFromName = function (name) {
    var words = name.replace(/\.[a-z0-9]+$/i, "").replace(/^\d{4}[-_]?\d{2}[-_]?\d{2}[-_ ]*/, "").replace(/^\d{1,3}[-_ ]+/, "")
      .replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().split(" ");
    return words.map(function (w, i) {
      if (!w || /[A-Z]/.test(w)) return w;                 // keep words you already capitalised (WAMI, MUSIC6S)
      if (/^(wami|mke|ep|wi|usa|dj|tv)$/.test(w)) return w.toUpperCase(); // common acronyms
      if (i > 0 && SMALL.test(w)) return w;                // small words stay lowercase mid-caption
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(" ");
  };

  // Resized copy via a free image service, so big phone photos load fast. Falls back to the original.
  LB.resized = function (path, w) {
    var abs = new URL(BASE + path, location.href).href;
    if (/^(localhost|127\.)/.test(location.hostname) || location.protocol === "file:" || /\.svg$/i.test(path)) return BASE + path;
    return "https://images.weserv.nl/?url=" + encodeURIComponent(abs) + "&w=" + w + "&q=82&output=webp";
  };
  LB.img = function (path, w, alt) {
    var img = LB.el("img");
    img.loading = "lazy"; img.decoding = "async"; img.alt = alt || "";
    img.src = LB.resized(path, w);
    img.onerror = function () { img.onerror = null; img.src = BASE + path; };
    return img;
  };

  // ----- Lightbox -----
  var lbItems = [], lbIdx = 0, lb, lbImg, lbCap;
  function lbShow() {
    var p = lbItems[lbIdx];
    lbImg.onerror = function () { lbImg.onerror = null; lbImg.src = BASE + p.path; };
    lbImg.src = LB.resized(p.path, 1800);
    lbImg.alt = p.cap || "";
    lbCap.textContent = p.cap || "";
  }
  function lbClose() { lb.hidden = true; lbImg.removeAttribute("src"); document.body.style.overflow = ""; }
  LB.openLightbox = function (items, i) {
    if (!lb) {
      lb = LB.el("div", "lightbox"); lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
      lb.innerHTML = '<button class="lb-close" aria-label="Close">&times;</button><button class="lb-prev" aria-label="Previous photo">&#8249;</button><figure><img alt=""><figcaption></figcaption></figure><button class="lb-next" aria-label="Next photo">&#8250;</button>';
      document.body.appendChild(lb);
      lbImg = lb.querySelector("img"); lbCap = lb.querySelector("figcaption");
      lb.querySelector(".lb-close").onclick = lbClose;
      lb.querySelector(".lb-prev").onclick = function () { lbIdx = (lbIdx - 1 + lbItems.length) % lbItems.length; lbShow(); };
      lb.querySelector(".lb-next").onclick = function () { lbIdx = (lbIdx + 1) % lbItems.length; lbShow(); };
      lb.addEventListener("click", function (e) { if (e.target === lb || e.target.tagName === "FIGURE") lbClose(); });
      document.addEventListener("keydown", function (e) {
        if (lb.hidden) return;
        if (e.key === "Escape") lbClose();
        if (e.key === "ArrowRight") lb.querySelector(".lb-next").click();
        if (e.key === "ArrowLeft") lb.querySelector(".lb-prev").click();
      });
    }
    lbItems = items; lbIdx = i; lbShow(); lb.hidden = false; document.body.style.overflow = "hidden";
    lb.querySelector(".lb-close").focus();
  };


  // ----- Booking email (assembled in the browser so spam bots can't scrape it) -----
  LB.bookingEmail = function () {
    var e = (window.SITE || {}).bookingEmail;
    return Array.isArray(e) && e[0] && e[1] ? e[0] + "@" + e[1] : null;
  };

  // ----- Forms (contact + mailing list) via Web3Forms -----
  LB.formKey = function () {
    var k = (window.SITE || {}).formKey;
    return k && !/YOUR-WEB3FORMS/.test(k) ? k : null;
  };
  LB.setupForms = function () {
    var key = LB.formKey();
    if (!key) { document.querySelectorAll("[data-needs-form]").forEach(function (n) { n.hidden = true; }); return; }
    document.querySelectorAll("form[data-form]").forEach(function (form) {
      // invisible honeypot box: real people never tick it, spam bots do
      var trap = document.createElement("input");
      trap.type = "checkbox"; trap.name = "botcheck"; trap.tabIndex = -1; trap.setAttribute("aria-hidden", "true");
      trap.style.cssText = "position:absolute;left:-9999px;opacity:0";
      form.appendChild(trap);
      var status = form.querySelector(".form-status"), btn = form.querySelector("button[type=submit]"), label = btn.textContent;
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var bad = Array.prototype.filter.call(form.querySelectorAll("[required]"), function (f) { return !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value)); });
        if (bad.length) { status.textContent = bad[0].type === "email" ? "Enter a valid email address so we can reply." : "Fill in every field so we can get back to you."; status.className = "form-status is-error"; bad[0].focus(); return; }
        var d = {}; new FormData(form).forEach(function (v, k) { d[k] = v; });
        var isSignup = form.dataset.form === "signup";
        var body = {
          access_key: key,
          from_name: "LostBrave.com",
          subject: isSignup ? "Mailing list signup: " + d.email : "LostBrave.com: " + (d.topic || "Message") + " from " + d.name,
          name: d.name || "", email: d.email,
          message: isSignup ? "Please add " + (d.name ? d.name + " (" + d.email + ")" : d.email) + " to the Lost Brave mailing list." : d.message,
          botcheck: trap.checked
        };
        if (!isSignup) body.topic = d.topic;
        btn.disabled = true; btn.textContent = "Sending";
        fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) })
          .then(function (r) { return r.json(); })
          .then(function (res) {
            if (!res.success) throw 0;
            form.reset();
            status.textContent = isSignup ? "You're on the list. See you at a show." : "Message sent. We'll get back to you soon.";
            status.className = "form-status is-ok";
          })
          .catch(function () {
            status.textContent = "That didn't send. Check your connection and try again, or message us on Instagram.";
            status.className = "form-status is-error";
          })
          .then(function () { btn.disabled = false; btn.textContent = label; });
      });
    });
  };

  // ----- Lyric lines -----
  LB.lyricLines = function (text) {
    return text.split("\n").map(function (s) { return s.trim(); })
      .filter(function (s) { return s && s.charAt(0) !== "#"; })
      .map(function (s) { var i = s.lastIndexOf(" | "); return i > -1 ? { line: s.slice(0, i).trim(), song: s.slice(i + 3).trim() } : { line: s, song: "" }; });
  };

  // ----- YouTube -----
  LB.youtubeId = function (u) {
    var m = /(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/.exec(u || "");
    return m ? m[1] : null;
  };
  LB.videoCard = function (title, url) {
    var id = LB.youtubeId(url);
    if (!id) return null;
    var box = LB.el("figure", "video");
    var btn = LB.el("button", "video-thumb");
    btn.setAttribute("aria-label", "Play " + (title || "video"));
    btn.style.backgroundImage = "url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg)";
    btn.appendChild(LB.el("span", "play"));
    btn.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      f.title = title || "Video";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      box.replaceChild(f, btn);
    });
    box.appendChild(btn);
    if (title) box.appendChild(LB.el("figcaption", null, title));
    box._id = id;
    return box;
  };
})();
