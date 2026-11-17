// Booking kit page. Reads booking-kit/* folders and content/kit-* files.
(function () {
  "use strict";
  var LB = window.LB, $ = LB.$, el = LB.el, BASE = window.BASE || "";
  // Folder name comes from the page address, so the booking-kit folder can be renamed freely.
  var KIT = location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "").split("/").pop() || "booking-kit";

  function sizeLabel(bytes) {
    if (!bytes) return "";
    return bytes > 1048576 ? (bytes / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(bytes / 1024)) + " KB";
  }

  function downloadCard(f, opts) {
    var card = el("div", "dl");
    var prev = el("a", "dl-preview");
    prev.href = BASE + f.path; prev.target = "_blank"; prev.rel = "noopener";
    prev.setAttribute("aria-label", "Open " + f.name);
    if (f.isImage) prev.appendChild(LB.img(f.path, opts.w || 700, LB.captionFromName(f.name)));
    else prev.appendChild(el("span", "dl-file", (f.name.split(".").pop() || "file").toUpperCase()));
    card.appendChild(prev);
    card.appendChild(el("span", "dl-name", f.name + (f.size ? " (" + sizeLabel(f.size) + ")" : "")));
    var a = el("a", "btn", "Download");
    a.href = BASE + f.path; a.setAttribute("download", f.name);
    card.appendChild(a);
    return card;
  }

  function fillFolder(folder, target, emptyText, opts) {
    LB.listFolder(folder).then(function (files) {
      if (!files.length) { target.appendChild(el("p", "kit-empty", emptyText)); return; }
      files.forEach(function (f) { target.appendChild(downloadCard(f, opts || {})); });
    });
  }

  fillFolder(KIT + "/stage-plot", $("plot-files"), "Stage plot available on request.", { w: 1600 });
  fillFolder(KIT + "/logos", $("logo-files"), "Logos available on request.", { w: 600 });
  fillFolder(KIT + "/press-photos", $("photo-files"), "Press photos available on request.", { w: 700 });

  LB.text("content/kit-tech.txt").then(function (t) {
    t = t.trim();
    if (t) { $("tech").textContent = t; $("tech-head").hidden = false; }
  });

  // Pitch: kit-pitch.txt, or the home page About text
  LB.text("content/kit-pitch.txt").then(function (t) {
    return t.trim() ? t : LB.text("content/about.txt");
  }).then(function (t) { LB.paragraphs($("pitch"), t); });

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

  // Quick facts
  LB.csv("content/kit-facts.csv").then(function (rows) {
    rows.forEach(function (r) {
      if (!r.label || !r.value) return;
      var d = el("div");
      d.appendChild(el("dt", null, r.label));
      d.appendChild(el("dd", null, r.value));
      $("facts").appendChild(d);
    });
    if (!$("facts").children.length) $("facts").hidden = true;
  });

  // Videos: kit-videos.csv, or the home page videos
  LB.csv("content/kit-videos.csv").then(function (rows) {
    return rows.length ? rows : LB.csv("content/videos.csv");
  }).then(function (rows) {
    rows.forEach(function (r) {
      var v = LB.videoCard(r.title, r.youtube_link);
      if (!v) return;
      var a = el("a", null, "Open on YouTube");
      a.href = "https://youtu.be/" + v._id; a.target = "_blank"; a.rel = "noopener";
      var cap = v.querySelector("figcaption") || v.appendChild(el("figcaption"));
      var small = el("span", "dl-name"); small.appendChild(a); cap.appendChild(el("br")); cap.appendChild(small);
      $("video-list").appendChild(v);
    });
    $("kit-videos").hidden = !$("video-list").children.length;
  });

  // Recent shows (last 8)
  LB.shows().then(function (s) {
    var list = s.upcoming.concat(s.past).slice(0, 8);
    list.forEach(function (x) {
      var d = LB.dateParts(x._d), li = el("li", "gig");
      var date = el("div", "gig-date");
      date.appendChild(el("span", "gig-day", String(d.day)));
      date.appendChild(el("span", "gig-mon", d.mon + " " + d.year));
      li.appendChild(date);
      var info = el("div", "gig-info");
      info.appendChild(el("h3", null, x.venue));
      info.appendChild(el("p", "gig-meta", [x.city, x.details].filter(Boolean).join(". ")));
      li.appendChild(info);
      $("recent").appendChild(li);
    });
    $("kit-shows").hidden = !list.length;
  });

  // Contact + social
  LB.links().then(function (L) {
    var ig = L.find("instagram"), fb = L.find("facebook"), yt = L.find("youtube"), email = LB.bookingEmail();
    [["instagram", ig, "Instagram"], ["facebook", fb, "Facebook"], ["youtube", yt, "YouTube"]].forEach(function (s) {
      if (!s[1]) return;
      document.querySelectorAll("[data-social]").forEach(function (box) {
        var a = el("a", "icon-link"); a.href = s[1]; a.target = "_blank"; a.rel = "noopener";
        a.setAttribute("aria-label", "Lost Brave on " + s[2]); a.innerHTML = LB.icon(s[0]);
        box.appendChild(a);
      });
    });
    function row(icon, label, value, href) {
      var a = el("a", "contact-row"); a.href = href;
      if (!/^mailto:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
      a.innerHTML = LB.icon(icon) + '<span class="c-label"></span><span class="c-value"></span>';
      a.querySelector(".c-label").textContent = label;
      a.querySelector(".c-value").textContent = value;
      $("contact-links").appendChild(a);
    }
    if (email) row("mail", "Email", email, "mailto:" + email);
    if (ig) row("instagram", "Instagram", "@" + ((/instagram\.com\/([^/?#]+)/i.exec(ig) || [])[1] || "lostbraveband"), ig);
    if (fb) row("facebook", "Facebook", "Lost Brave", fb);
  });
})();
