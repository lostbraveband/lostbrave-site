// Home page. Fills the page from the files in /content, /photos and /merch.
(function () {
  "use strict";
  var LB = window.LB, $ = LB.$, el = LB.el;

  $("year").textContent = new Date().getFullYear();

  // Tagline, or a random lyric line from content/lyrics.txt
  Promise.all([LB.text("content/tagline.txt"), LB.text("content/lyrics.txt")]).then(function (t) {
    var lines = LB.lyricLines(t[1]), box = $("lyric"), p = box.querySelector("p");
    if (lines.length) {
      var pick = lines[Math.floor(Math.random() * lines.length)];
      p.textContent = pick.line;
      box.classList.add("is-lyric");
      if (pick.song) box.appendChild(el("cite", null, pick.song));
    } else if (t[0].trim()) p.textContent = t[0].trim();
  });

  // Members
  LB.csv("content/members.csv").then(function (rows) {
    rows.forEach(function (r) {
      if (!r.name) return;
      var li = el("li");
      li.appendChild(el("span", "m-name", r.name));
      if (r.plays) li.appendChild(el("span", "m-plays", r.plays));
      $("members").appendChild(li);
    });
    if (!rows.length) $("members").hidden = true;
  });

  LB.setupForms();

  LB.text("content/music-note.txt").then(function (t) { $("music-note").textContent = t.trim(); });
  LB.text("content/about.txt").then(function (t) { LB.paragraphs($("about-text"), t); });

  // Shows
  function gig(s) {
    var d = LB.dateParts(s._d);
    var li = el("li", "gig");
    var date = el("div", "gig-date");
    date.innerHTML = '<span class="gig-day"></span><span class="gig-mon"></span>';
    date.querySelector(".gig-day").textContent = d.day;
    date.querySelector(".gig-mon").textContent = d.mon + " " + d.year;
    li.appendChild(date);
    var info = el("div", "gig-info");
    info.appendChild(el("h3", null, s.venue || "Venue to be announced"));
    var meta = [d.dow + (s.time ? " at " + s.time : ""), s.city].filter(Boolean).join(", ");
    info.appendChild(el("p", "gig-meta", meta));
    if (s.details) info.appendChild(el("p", "gig-details", s.details));
    li.appendChild(info);
    if (s.link) {
      var a = el("a", "btn", "Tickets and info");
      a.href = LB.safeUrl(s.link); a.target = "_blank"; a.rel = "noopener";
      li.appendChild(a);
    }
    return li;
  }
  LB.shows().then(function (s) {
    s.upcoming.forEach(function (x) { $("upcoming").appendChild(gig(x)); });
    s.past.forEach(function (x) { $("past").appendChild(gig(x)); });
    $("no-upcoming").hidden = s.upcoming.length > 0;
    $("past-wrap").hidden = s.past.length === 0;
    var n = s.upcoming[0];
    if (n) {
      var d = LB.dateParts(n._d), stub = $("next-show");
      stub.querySelector(".stub-date").textContent = d.dow + " " + d.mon + " " + d.day;
      stub.querySelector(".stub-venue").textContent = n.venue;
      stub.hidden = false;
    }
  });

  // Links: social icons, listen chips, contact, message-to-buy
  LB.links().then(function (L) {
    var ig = L.find("instagram"), fb = L.find("facebook"), yt = L.find("youtube");
    var socials = [["instagram", ig, "Instagram"], ["facebook", fb, "Facebook"], ["youtube", yt, "YouTube"]].filter(function (s) { return s[1]; });
    document.querySelectorAll("[data-social]").forEach(function (box) {
      socials.forEach(function (s) {
        var a = el("a", "icon-link");
        a.href = s[1]; a.target = "_blank"; a.rel = "noopener";
        a.setAttribute("aria-label", "Lost Brave on " + s[2]);
        a.innerHTML = LB.icon(s[0]);
        box.appendChild(a);
      });
    });

    L.all.filter(function (r) { return r.type === "listen"; }).forEach(function (r) {
      var a = el("a", "chip", r.label);
      a.href = LB.safeUrl(r.url); a.target = "_blank"; a.rel = "noopener";
      $("listen-links").appendChild(a);
    });

    var msg = document.querySelector("[data-message]");
    [["Message us on Instagram", LB.messageUrl(ig)], ["Message us on Facebook", LB.messageUrl(fb)]].forEach(function (m) {
      if (!m[1]) return;
      var a = el("a", "btn", m[0]); a.href = m[1]; a.target = "_blank"; a.rel = "noopener";
      msg.appendChild(a);
    });

    var contact = $("contact-links");
    function row(icon, label, value, href) {
      var a = el("a", "contact-row");
      a.href = href;
      if (!/^mailto:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
      a.innerHTML = LB.icon(icon) + '<span class="c-label"></span><span class="c-value"></span>';
      a.querySelector(".c-label").textContent = label;
      a.querySelector(".c-value").textContent = value;
      contact.appendChild(a);
    }
    if (ig) row("instagram", "Instagram", "@" + (/instagram\.com\/([^/?#]+)/i.exec(ig) || [, "lostbraveband"])[1], LB.messageUrl(ig));
    if (fb) row("facebook", "Facebook", "Lost Brave", LB.messageUrl(fb));
    if (!LB.formKey()) document.querySelector(".contact-alt").hidden = true;
  });

  // Videos
  LB.csv("content/videos.csv").then(function (rows) {
    rows.forEach(function (r) { var v = LB.videoCard(r.title, r.youtube_link); if (v) $("videos").appendChild(v); });
  });

  // Photo gallery (duotone; full colour on hover and in the viewer)
  LB.listFolder("photos").then(function (files) {
    var items = files.filter(function (f) { return f.isImage; }).map(function (f) { return { path: f.path, cap: LB.captionFromName(f.name) }; });
    if (!items.length) return;
    $("photos").hidden = false;
    items.forEach(function (p, i) {
      var b = el("button", "g-item duo");
      b.setAttribute("aria-label", "Open photo" + (p.cap ? ": " + p.cap : ""));
      b.appendChild(LB.img(p.path, 900, p.cap));
      b.addEventListener("click", function () { LB.openLightbox(items, i); });
      $("gallery").appendChild(b);
    });
  });

  // Shirts
  LB.csv("content/merch.csv").then(function (rows) {
    rows.forEach(function (r) {
      if (!r.item) return;
      var c = el("div", "merch-item");
      var h = el("h3", null, r.item);
      if (r.price) h.appendChild(el("span", "price", r.price));
      c.appendChild(h);
      if (r.details) c.appendChild(el("p", null, r.details));
      $("merch-list").appendChild(c);
    });
  });
  LB.listFolder("merch").then(function (files) {
    var items = files.filter(function (f) { return f.isImage; }).reverse().map(function (f) { return { path: f.path, cap: LB.captionFromName(f.name) }; });
    items.forEach(function (p, i) {
      var b = el("button", "shirt");
      b.setAttribute("aria-label", "Open photo" + (p.cap ? ": " + p.cap : ""));
      b.appendChild(LB.img(p.path, 700, p.cap));
      b.addEventListener("click", function () { LB.openLightbox(items, i); });
      $("shirt-photos").appendChild(b);
    });
    if (!items.length) $("shirt-photos").remove();
  });
})();
