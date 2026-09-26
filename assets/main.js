/* =========================================================
   Zemeljska dela in gradbeništvo, Damir Lovrek s.p. — main.js
   Brez knjižnic. Vsak del preveri, ali njegov element obstaja,
   zato ista skripta teče tudi na zasebnost.html in 404.html.
   ========================================================= */
(function () {
  'use strict';

  var d = document, w = window, html = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  var MAIL = 'damir.lovrek94@gmail.com';
  var TEL = '031 666 826';
  var CK_KEY = 'lv-piskotki';
  var INTRO_KEY = 'lv-uvod';
  var MAP_SRC = 'https://www.google.com/maps?q=' +
    encodeURIComponent('Zemeljska dela in gradbeništvo, Damir Lovrek s.p., Medlog 23a, 3000 Celje') +
    '&z=15&hl=sl&output=embed';
  var EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
  var RM = html.classList.contains('rm');
  var mqFine = w.matchMedia('(hover: hover) and (pointer: fine)');

  /* =======================================================
     1. Uvod: bager se izriše (CSS), zajame zemljo, zavesa se dvigne
     ======================================================= */
  var pl = $('#pl'), heroStarted = false;
  function startHero() {
    if (heroStarted) return;
    heroStarted = true;
    html.classList.add('hero-go');
  }

  if (pl && html.classList.contains('intro')) {
    var plMark = $('#pl-mark'), sym = $('#lv-mark');
    if (plMark && sym) plMark.innerHTML = sym.innerHTML; /* prave poti (ne <use>), da jih CSS lahko animira */
    var timers = [], done = false, SKIP = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    var later = function (fn, ms) { timers.push(setTimeout(fn, ms)); };
    var skip = function () { finish(true); };
    var finish = function (fast) {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      SKIP.forEach(function (t) { w.removeEventListener(t, skip, true); });
      try { sessionStorage.setItem(INTRO_KEY, '1'); } catch (e) {}
      pl.classList.add('word', 'out');
      setTimeout(startHero, fast ? 0 : 140);
      setTimeout(function () {
        html.classList.remove('intro');
        if (pl.parentNode) pl.parentNode.removeChild(pl);
        showCookieBanner(500);
      }, 760);
    };
    later(function () { pl.classList.add('word'); }, 1150);
    later(function () { pl.classList.add('dig'); }, 1450);
    later(function () { finish(false); }, 2450);
    SKIP.forEach(function (t) { w.addEventListener(t, skip, { passive: true, capture: true }); });
  } else {
    if (pl && pl.parentNode) pl.parentNode.removeChild(pl);
    /* dva okvirja, da brskalnik najprej izriše začetno stanje in prehod res steče */
    requestAnimationFrame(function () { requestAnimationFrame(startHero); });
    setTimeout(startHero, 1200);
  }

  /* =======================================================
     2. Glava, napredek branja, plavajoča gumba
     ======================================================= */
  var nav = $('#nav'), toTop = $('#to-top'), fab = $('#call-fab'), bar = $('.progress i');
  var cssProgress = !RM && w.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');
  var menuOpen = false, ticking = false, callVisible = false, maxScroll = 0;

  /* Črto napredka z JS premikamo samo na računalniku brez CSS časovnice drsenja (na telefonu je skrita).
     Dolžino strani izmerimo le ob spremembi velikosti – branje scrollHeight ob vsakem okvirju sproži preračun postavitve. */
  var jsProgress = !!bar && !cssProgress && mqFine.matches;
  var measure = function () { maxScroll = Math.max(0, html.scrollHeight - w.innerHeight); };
  if (jsProgress) {
    measure();
    w.addEventListener('load', measure);
    if ('ResizeObserver' in w) new ResizeObserver(function () { measure(); onScroll(); }).observe(d.body);
  }

  /* plavajoči gumb za klic se skrije, ko so na zaslonu kontakt, poziv ali noga (tam je klic že na voljo) */
  if (fab && 'IntersectionObserver' in w) {
    var seen = new Set();
    var fabIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) seen.add(en.target); else seen.delete(en.target); });
      callVisible = seen.size > 0;
      onScroll();
    });
    $$('#kontakt, .cta, .footer').forEach(function (el) { fabIO.observe(el); });
  }

  function frame() {
    ticking = false;
    var y = w.pageYOffset || html.scrollTop;
    if (nav) nav.classList.toggle('is-solid', y > 40 || menuOpen);
    var past = y > w.innerHeight * 0.75;
    if (toTop) toTop.classList.toggle('is-on', past);
    if (fab) fab.classList.toggle('is-on', past && !callVisible);
    if (jsProgress) bar.style.transform = 'scaleX(' + (maxScroll > 0 ? Math.min(1, y / maxScroll) : 0) + ')';
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  w.addEventListener('scroll', onScroll, { passive: true });
  w.addEventListener('resize', function () { if (jsProgress) measure(); onScroll(); }, { passive: true });
  frame();

  if (toTop) toTop.addEventListener('click', function () {
    w.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
    var brand = $('.nav .brand');
    if (brand) brand.focus({ preventScroll: true });
  });

  /* trenutni razdelek v navigaciji */
  var navLinks = $$('.nav__links a');
  if (navLinks.length && 'IntersectionObserver' in w) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        var a = byId[en.target.id];
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { secIO.observe(s); });
  }

  /* =======================================================
     3. Mobilni meni
     ======================================================= */
  var burger = $('.burger'), mm = $('#mmenu');
  function setMenu(open) {
    if (!burger || !mm) return;
    menuOpen = open;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Zapri meni' : 'Odpri meni');
    mm.classList.toggle('is-open', open);
    mm.inert = !open;
    ['#vsebina', '.footer'].forEach(function (s) { var el = $(s); if (el) el.inert = open; });
    d.body.style.overflow = open ? 'hidden' : '';
    frame();
  }
  if (burger && mm) {
    burger.addEventListener('click', function () { setMenu(!menuOpen); });
    $$('a', mm).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) { setMenu(false); burger.focus(); }
    });
    w.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) { if (e.matches && menuOpen) setMenu(false); });
  }

  /* =======================================================
     4. Razkrivanje ob drsenju (enkrat) + števca
     ======================================================= */
  var counters = $$('[data-count]').filter(function (el) { return !el.hasAttribute('data-plain'); });
  function fmt(v, dec) { return v.toFixed(dec).replace('.', ','); }
  function runCounter(el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-decimals') || 0), t0 = null;
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    var step = function (ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / 1100);
      el.textContent = fmt(to * ease(p), dec);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if (!RM) counters.forEach(function (el) { el.textContent = fmt(0, +(el.getAttribute('data-decimals') || 0)); });

  var revealEls = $$('.rv, .rv-clip, [data-steps]');
  if ('IntersectionObserver' in w) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
        if (!RM) $$('[data-count]', en.target).forEach(function (c) { if (counters.indexOf(c) > -1) runCounter(c); });
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
    counters.forEach(function (el) { el.textContent = fmt(parseFloat(el.getAttribute('data-count')), +(el.getAttribute('data-decimals') || 0)); });
  }

  /* povezave iz kartic storitev vnaprej izberejo vrsto dela v obrazcu */
  $$('[data-svc]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = $('#f-storitev');
      if (sel) sel.value = a.getAttribute('data-svc');
    });
  });

  /* =======================================================
     5. Galerija: filtri po vrsti dela, »pokaži vse«, povečava
     ======================================================= */
  var gal = $('#gal');
  if (gal) {
    var items = $$('.g-item', gal), chips = $$('.chip'), more = $('#gal-more'), gStatus = $('#gal-status');
    var LIMIT = 12, cur = 'vse', expanded = false;
    var plural = function (n) {
      var m = n % 100;
      return m === 1 ? 'fotografija' : m === 2 ? 'fotografiji' : (m === 3 || m === 4) ? 'fotografije' : 'fotografij';
    };
    var visibleItems = function () { return items.filter(function (it) { return !it.hidden; }); };

    var applyFilter = function (animateAll) {
      var shown = 0, fresh = [];
      items.forEach(function (it) {
        var match = cur === 'vse' || it.getAttribute('data-cat') === cur;
        var show = match && (cur !== 'vse' || expanded || shown < LIMIT);
        if (show) shown++;
        if (show && (animateAll || it.hidden)) fresh.push(it);
        it.hidden = !show;
      });
      if (more) {
        more.hidden = !(cur === 'vse' && !expanded);
        $('span', more).textContent = 'Pokaži vse fotografije (' + items.length + ')';
      }
      if (gStatus) {
        var label = cur === 'vse' ? 'Vse' : $('.chip[data-f="' + cur + '"] span').textContent;
        gStatus.textContent = label + ': prikazanih ' + shown + ' ' + plural(shown) + (cur === 'vse' && !expanded ? ' od ' + items.length : '') + '.';
      }
      if (!RM && fresh.length && gal.animate) {
        fresh.slice(0, 16).forEach(function (it, i) {
          it.animate(
            [{ opacity: 0, transform: 'translateY(10px) scale(.98)' }, { opacity: 1, transform: 'none' }],
            { duration: 320, delay: i * 35, easing: EASE_OUT, fill: 'backwards' }
          );
        });
      }
    };

    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var f = c.getAttribute('data-f');
        if (f === cur) return;
        cur = f;
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        applyFilter(true);
      });
    });
    if (more) more.addEventListener('click', function () {
      var firstNew = null;
      expanded = true;
      applyFilter(false);
      items.some(function (it, i) { if (i >= LIMIT && !it.hidden) { firstNew = it; return true; } return false; });
      if (firstNew) firstNew.focus({ preventScroll: true });
    });
    applyFilter(false);

    /* povečava v <dialog> */
    var lb = $('#lb'), lbImg = $('#lb-img'), lbCap = $('#lb-cap'), lbCount = $('#lb-count');
    var list = [], idx = 0, lastFocus = null;
    var preload = function (it) { if (it) { var im = new Image(); im.src = it.getAttribute('href'); } };
    var show = function (i) {
      idx = (i + list.length) % list.length;
      var it = list[idx], img = $('img', it);
      lbImg.removeAttribute('width');
      lbImg.removeAttribute('height');
      lbImg.src = it.getAttribute('href');
      lbImg.alt = img ? img.alt : '';
      lbCap.textContent = it.getAttribute('data-cap');
      lbCount.textContent = (idx + 1) + ' / ' + list.length;
      preload(list[(idx + 1) % list.length]);
      preload(list[(idx - 1 + list.length) % list.length]);
    };
    var closeLb = function () { if (lb.open) lb.close(); };

    if (lb && lb.showModal) {
      items.forEach(function (it) {
        it.addEventListener('click', function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          list = visibleItems();
          lastFocus = it;
          show(list.indexOf(it));
          html.style.overflow = 'hidden';
          lb.showModal();
        });
      });
      $('.lb__prev', lb).addEventListener('click', function () { show(idx - 1); });
      $('.lb__next', lb).addEventListener('click', function () { show(idx + 1); });
      $('.lb__close', lb).addEventListener('click', closeLb);
      lb.addEventListener('click', function (e) {
        if (e.target === lb || e.target.classList.contains('lb__fig')) closeLb();
      });
      lb.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
      });
      lb.addEventListener('close', function () {
        html.style.overflow = '';
        if (lastFocus) lastFocus.focus({ preventScroll: true });
      });
      var tx = null, ty = null;
      lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
      lb.addEventListener('touchend', function (e) {
        if (tx === null) return;
        var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
        tx = null;
      });
    }
  }

  /* =======================================================
     6. Pogosta vprašanja
     ======================================================= */
  $$('.faq-q').forEach(function (b) {
    var item = b.closest('.faq-item'), panel = d.getElementById(b.getAttribute('aria-controls'));
    if (panel) panel.inert = true;
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      item.classList.toggle('is-open', open);
      if (panel) panel.inert = !open;
    });
  });

  /* =======================================================
     7. Obrazec: sporočilo se odpre v Gmailu (ali v e-poštnem programu)
     ======================================================= */
  var form = $('#form');
  if (form) {
    var fStatus = $('#form-status'), tried = false, lastBtn = 'gmail';
    var rules = {
      ime: function (v) { return v.trim().length >= 2 ? '' : 'Vpišite ime in priimek.'; },
      telefon: function (v) { return v.replace(/\D/g, '').length >= 6 ? '' : 'Vpišite telefonsko številko, da vas lahko pokličemo.'; },
      email: function (v) { return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'E-poštni naslov ni pravilen (npr. ime@primer.si).'; },
      sporocilo: function (v) { return v.trim().length >= 10 ? '' : 'Na kratko opišite delo (vsaj 10 znakov).'; }
    };
    var check = function (name) {
      var f = form.elements[name], msg = rules[name](f.value), err = d.getElementById(f.getAttribute('aria-describedby'));
      f.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg;
      return !msg;
    };
    Object.keys(rules).forEach(function (n) {
      var f = form.elements[n];
      f.addEventListener('blur', function () { if (tried || f.value) check(n); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') check(n); });
    });
    $$('button[type="submit"]', form).forEach(function (b) { b.addEventListener('click', function () { lastBtn = b.value; }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      tried = true;
      var first = null;
      Object.keys(rules).forEach(function (n) { if (!check(n) && !first) first = form.elements[n]; });
      if (first) {
        fStatus.textContent = '';
        fStatus.classList.remove('is-ok');
        first.focus();
        return;
      }
      var v = function (n) { return form.elements[n].value.trim(); };
      var sto = v('storitev'), kraj = v('kraj');
      var body = 'Pozdravljeni,\n\n' + v('sporocilo') +
        '\n\n—\nIme in priimek: ' + v('ime') +
        '\nTelefon: ' + v('telefon') +
        (v('email') ? '\nE-pošta: ' + v('email') : '') +
        (kraj ? '\nKraj izvedbe: ' + kraj : '') +
        '\nVrsta dela: ' + sto +
        '\nŽeleni začetek: ' + v('rok') +
        '\n\nPoslano prek obrazca na spletni strani.';
      var subj = 'Povpraševanje: ' + sto + (kraj ? ' – ' + kraj : '');
      var mailto = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
      var via = (e.submitter && e.submitter.value) || lastBtn;

      /* Gmail v brskalniku odpre okno za pisanje z izpolnjenim prejemnikom, zadevo in besedilom.
         Na telefonu spletni Gmail izpolnjena polja izgubi, zato tam odpremo e-poštno aplikacijo (na Androidu Gmail). */
      if (via === 'mailto' || !mqFine.matches) {
        w.location.href = mailto;
        fStatus.textContent = 'Odpira se e-pošta s pripravljenim sporočilom – preverite ga in kliknite »Pošlji«. Če se ni odprla, pišite na ' + MAIL + ' ali pokličite ' + TEL + '.';
      } else {
        var gmail = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(MAIL) +
          '&su=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
        var win = w.open(gmail, '_blank');
        if (win) win.opener = null; else w.location.href = gmail;
        fStatus.textContent = 'Gmail se je odprl v novem zavihku s pripravljenim sporočilom – preverite ga in kliknite »Pošlji«. Če niste prijavljeni, se najprej prijavite v svoj Google račun.';
      }
      fStatus.classList.add('is-ok');
    });
  }

  /* =======================================================
     8. Piškotki in zemljevid (Google Maps samo s soglasjem ali na klik)
     ======================================================= */
  var ck = $('#ck'), ckd = $('#ckd'), ckExt = $('#ck-ext'), map = $('#map');

  function readConsent() {
    try { var c = JSON.parse(localStorage.getItem(CK_KEY)); return c && c.v === 1 ? c : null; } catch (e) { return null; }
  }
  function loadMap() {
    if (!map || map.classList.contains('has-map')) return;
    var f = d.createElement('iframe');
    f.src = MAP_SRC;
    f.title = 'Zemljevid: Medlog 23a, 3000 Celje';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.allowFullscreen = true;
    map.appendChild(f);
    map.classList.add('has-map');
  }
  function unloadMap() {
    if (!map) return;
    var f = $('iframe', map);
    if (f) f.parentNode.removeChild(f);
    map.classList.remove('has-map');
  }
  function applyConsent(c) { if (c && c.zunanje) loadMap(); else unloadMap(); }
  function hideBanner() {
    if (!ck || ck.hidden) return;
    ck.classList.remove('is-open');
    setTimeout(function () { ck.hidden = true; }, RM ? 0 : 420);
  }
  function saveConsent(ext) {
    var c = { v: 1, zunanje: !!ext, cas: new Date().toISOString() };
    try { localStorage.setItem(CK_KEY, JSON.stringify(c)); } catch (e) {}
    applyConsent(c);
    hideBanner();
  }
  function showCookieBanner(delay) {
    if (!ck || readConsent()) return;
    setTimeout(function () {
      if (readConsent()) return;
      ck.hidden = false;
      void ck.offsetWidth; /* začetno stanje, preden steče prehod */
      ck.classList.add('is-open');
    }, delay || 0);
  }
  if (ck) {
    $$('[data-ck]', ck).forEach(function (b) {
      b.addEventListener('click', function () { saveConsent(b.getAttribute('data-ck') === 'all'); });
    });
  }
  $$('[data-ck-open]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!ckd || !ckd.showModal) return;
      var c = readConsent();
      if (ckExt) ckExt.checked = !!(c && c.zunanje);
      ckd.returnValue = '';
      ckd.showModal();
    });
  });
  if (ckd) ckd.addEventListener('close', function () {
    if (ckd.returnValue === 'save') saveConsent(ckExt && ckExt.checked);
    else if (ckd.returnValue === 'all') saveConsent(true);
  });
  var mapBtn = $('#map-load');
  if (mapBtn) mapBtn.addEventListener('click', loadMap);

  var consent = readConsent();
  if (consent) applyConsent(consent);
  if (!html.classList.contains('intro')) showCookieBanner(1000);

  /* =======================================================
     9. Drobnarije
     ======================================================= */
  var leto = $('#leto');
  if (leto) leto.textContent = new Date().getFullYear();
})();
