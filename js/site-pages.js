/* Noor Communication : comportement commun du site.
   Les données viennent de Supabase quand js/config.js est renseigné,
   sinon du catalogue local (js/data.js). */
(function () {
  'use strict';
  var CFG = window.NOOR_CONFIG || {};
  var D = window.NOOR_DATA || { categories: [], works: {}, tariffs: [] };
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function plural(n, one, many) { return n + ' ' + (n > 1 ? many : one); }

  /* ---------- menu mobile ---------- */
  var burger = $('#burger'), mnav = $('#mnav');
  function setMenu(open) {
    if (!mnav) return;
    mnav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) {
    burger.addEventListener('click', function () { setMenu(true); });
    $('#mclose').addEventListener('click', function () { setMenu(false); });
    $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  /* ---------- catalogue ---------- */
  function localCatalogue() {
    var source = D.categories || [];
    function oldCategory(id) { return source.filter(function (c) { return c.id === id; })[0]; }
    function buildSubs(category, familyId) {
      return (category ? category.subs : []).map(function (s) {
        return {
          id: s.id, name: s.name, desc: s.desc, price: s.price || 'Bientôt disponible',
          familyId: familyId || null,
          works: (s.works || []).map(function (id) {
            var w = D.works[id] || {};
            return { id: id, title: w.title || id, meta: w.meta || '', thumb: w.thumb || '', full: w.full || w.thumb || '', tw: w.tw || 560, th: w.th || 560, light: !!w.light };
          })
        };
      });
    }
    var identity = oldCategory('identite'), print = oldCategory('print'), video = oldCategory('video');
    var categories = [
      {
        id: 'design-graphique', name: 'Design graphique', tagline: 'Identité visuelle et supports graphiques',
        aliases: ['identite','print'],
        families: [
          { id: 'identite-visuelle', name: 'Identité visuelle', description: 'Logos, identités et chartes graphiques' },
          { id: 'supports-graphiques', name: 'Supports graphiques', description: 'Supports imprimés et visuels pour les réseaux sociaux' }
        ],
        subs: buildSubs(identity, 'identite-visuelle').concat(buildSubs(print, 'supports-graphiques'))
      },
      { id: 'photographie', name: 'Photographie', tagline: 'Studio, extérieur, événements, beauté et produit', aliases: ['photo'], families: [], subs: buildSubs(oldCategory('photo')) },
      { id: 'videographie', name: 'Vidéographie', tagline: 'Production vidéo et motion design', aliases: ['video'], families: [], subs: buildSubs({ subs: (video ? video.subs : []).filter(function (s) { return s.id !== 'live'; }) }) },
      { id: 'live-streaming', name: 'Live streaming', tagline: 'Couverture et diffusion en direct d’événements', aliases: [], families: [], subs: buildSubs({ subs: (video ? video.subs : []).filter(function (s) { return s.id === 'live'; }) }) },
      { id: 'edition', name: 'Édition', tagline: 'Conception, mise en page et publication de documents', aliases: [], families: [], subs: buildSubs(oldCategory('edition')) },
      { id: 'communication-digitale', name: 'Communication digitale', tagline: 'Stratégie digitale et gestion des communautés', aliases: ['digital'], families: [], subs: buildSubs(oldCategory('digital')) },
      { id: 'web-applications', name: 'Web et applications', tagline: 'Création, hébergement et maintenance de solutions web', aliases: ['web'], families: [], subs: buildSubs(oldCategory('web')) }
    ];
    var oldToNew = { identite: 'design-graphique', print: 'design-graphique', edition: 'edition', photo: 'photographie', video: 'videographie', digital: 'communication-digitale', web: 'web-applications' };
    var tariffs = (D.tariffs || []).map(function (t) {
      var category = t[0] === 'video' && t[1] === 'Live streaming' ? 'live-streaming' : oldToNew[t[0]] || t[0];
      return [category, t[1], t[2], t[3], t[4] || '', t[5] || '', t[6] || '', t[7] || ''];
    });
    tariffs.push(
      ['photographie', 'Photo beauté', 'Portraits éditoriaux, maquillage et mise en valeur', 20, 'Dès', '', '', ''],
      ['photographie', 'Photo produit', 'Packshot et mise en scène de produits', 15, 'Dès', '', '', '']
    );
    return { categories: categories, tariffs: tariffs };
  }
  var cataloguePromise = null;
  function loadCatalogue() {
    if (cataloguePromise) return cataloguePromise;
    var local = localCatalogue();
    if (!CFG.supabaseUrl || !CFG.supabaseKey || !window.supabase) {
      cataloguePromise = Promise.resolve(local);
      return cataloguePromise;
    }
    var sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey);
    cataloguePromise = Promise.all([
      sb.from('catalogue_categories').select('id,slug,name,tagline,pole_name,sort_order').eq('is_published', true).eq('is_archived', false).order('sort_order'),
      sb.from('catalogue_category_families').select('id,category_id,slug,name,description,sort_order').eq('is_published', true).eq('is_archived', false).order('sort_order'),
      sb.from('catalogue_subcategories').select('id,category_id,family_id,slug,name,description,sort_order').eq('is_published', true).eq('is_archived', false).order('sort_order'),
      sb.from('catalogue_category_aliases').select('category_id,alias_slug'),
      sb.from('projects').select('id,title,slug,category,category_id,subcategory_id,short_description,description,cover_image,gallery,client_name,year,is_featured,sort_order').eq('is_published', true).order('sort_order'),
      sb.from('service_pricing').select('category,category_id,subcategory_id,service,detail,price,price_prefix,price_suffix,standard,express,sort_order').eq('is_published', true).order('sort_order')
    ]).then(function (r) {
      if (r.some(function (x) { return x.error; }) || !r[0].data || !r[0].data.length) return local;
      var categories = r[0].data;
      var families = r[1].data || [];
      var subcategories = r[2].data || [];
      var aliases = r[3].data || [];
      var projects = r[4].data || [];
      var tariffsRaw = r[5].data || [];
      var worksBySub = {};
      projects.forEach(function (w) {
        if (!w.subcategory_id) return;
        if (!worksBySub[w.subcategory_id]) worksBySub[w.subcategory_id] = [];
        var localWork = D.works && D.works[w.slug] ? D.works[w.slug] : {};
        var image = w.cover_image || localWork.full || '';
        worksBySub[w.subcategory_id].push({
          id: w.slug || w.id,
          title: w.title,
          meta: [w.short_description, w.client_name, w.year].filter(Boolean).join(' · '),
          thumb: localWork.thumb || image,
          full: image,
          tw: localWork.tw || 560,
          th: localWork.th || 560,
          light: !!localWork.light
        });
      });
      var tariffs = tariffsRaw.map(function (t) {
        var category = categories.filter(function (x) { return x.id === t.category_id; })[0];
        return [category ? category.slug : t.category, t.service, t.detail || '', t.price, t.price_prefix || '', t.price_suffix || '', t.standard || '', t.express || ''];
      });
      var built = categories.map(function (category) {
        var catFamilies = families.filter(function (x) { return x.category_id === category.id; }).map(function (x) {
          return { id: x.id, slug: x.slug, name: x.name, description: x.description || '' };
        });
        var subs = subcategories.filter(function (x) { return x.category_id === category.id; }).map(function (sub) {
          var subTariffs = tariffsRaw.filter(function (t) { return t.subcategory_id === sub.id; });
          var first = subTariffs[0];
          var price = first ? ((first.price_prefix ? first.price_prefix + ' ' : '') + first.price + (first.price_suffix ? ' ' + first.price_suffix : '')).trim() : 'Bientôt disponible';
          return {
            id: sub.slug,
            name: sub.name,
            desc: sub.description || '',
            price: price,
            familyId: sub.family_id || null,
            works: worksBySub[sub.id] || []
          };
        });
        return {
          id: category.slug,
          name: category.name,
          tagline: category.tagline || '',
          poleName: category.pole_name || '',
          families: catFamilies,
          aliases: aliases.filter(function (a) { return a.category_id === category.id; }).map(function (a) { return a.alias_slug; }),
          subs: subs
        };
      });
      return { categories: built, tariffs: tariffs };
    }).catch(function () { return local; });
    return cataloguePromise;
  }
  function catCount(c) { return c.subs.reduce(function (n, s) { return n + s.works.length; }, 0); }
  function catCover(c) {
    for (var i = 0; i < c.subs.length; i++) if (c.subs[i].works.length) return c.subs[i].works[0];
    return null;
  }
  function coverImg(w) {
    return w ? '<img src="' + esc(w.thumb) + '" alt="" loading="lazy" width="' + (w.tw || 560) + '" height="' + (w.th || 560) + '">'
             : '<span class="ph" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5-4.5 3.5 3L16 13l4 4"/></svg></span>';
  }

  /* ---------- visionneuse (agrandissement) ---------- */
  var lb = null, lbItems = [], lbIndex = 0, lbOpener = null, lbToken = 0;
  function buildLb() {
    lb = document.createElement('div');
    lb.className = 'lbx';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Agrandissement de la création');
    lb.innerHTML =
      '<button class="lbx-close" type="button" aria-label="Fermer">✕</button>' +
      '<button class="lbx-nav lbx-prev" type="button" aria-label="Image précédente">‹</button>' +
      '<button class="lbx-nav lbx-next" type="button" aria-label="Image suivante">›</button>' +
      '<figure class="lbx-fig"><div class="lbx-stage"><img class="lbx-img" alt=""></div>' +
      '<figcaption class="lbx-cap"><b></b><span></span><em></em></figcaption></figure>';
    document.body.appendChild(lb);
    $('.lbx-close', lb).addEventListener('click', closeLb);
    $('.lbx-prev', lb).addEventListener('click', function () { stepLb(-1); });
    $('.lbx-next', lb).addEventListener('click', function () { stepLb(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lbx-stage')) closeLb(); });
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) stepLb(dx < 0 ? 1 : -1);
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) { if (e.key === 'Escape') setMenu(false); return; }
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') stepLb(-1);
      else if (e.key === 'ArrowRight') stepLb(1);
    });
  }
  function showLb() {
    var it = lbItems[lbIndex], img = $('.lbx-img', lb), tok = ++lbToken;
    img.classList.add('loading');
    img.alt = it.title + ', ' + it.meta;
    img.src = it.thumb;
    var pre = new Image();
    pre.onload = function () { if (tok === lbToken) { img.src = it.full; img.classList.remove('loading'); } };
    pre.onerror = function () { if (tok === lbToken) img.classList.remove('loading'); };
    pre.src = it.full;
    $('.lbx-cap b', lb).textContent = it.title;
    $('.lbx-cap span', lb).textContent = it.meta;
    $('.lbx-cap em', lb).textContent = lbItems.length > 1 ? (lbIndex + 1) + ' / ' + lbItems.length : '';
    $('.lbx-prev', lb).hidden = $('.lbx-next', lb).hidden = lbItems.length < 2;
    lb.classList.toggle('light', !!it.light);
  }
  function openLb(items, i, opener) {
    if (!lb) buildLb();
    lbItems = items; lbIndex = i; lbOpener = opener || null;
    showLb();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('.lbx-close', lb).focus();
  }
  function stepLb(d) { lbIndex = (lbIndex + d + lbItems.length) % lbItems.length; showLb(); }
  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (lbOpener && document.contains(lbOpener)) lbOpener.focus();
  }
  function workButtons(works, root) {
    $$('.work', root).forEach(function (b, i) {
      b.addEventListener('click', function () { openLb(works, i, b); });
    });
  }
  function galleryHtml(works) {
    return works.map(function (w) {
      return '<button class="work' + (w.light ? ' light-img' : '') + '" type="button" aria-label="Agrandir : ' + esc(w.title) + '">' +
        '<img src="' + esc(w.thumb) + '" alt="' + esc(w.title + ', ' + w.meta) + '" loading="lazy" width="' + (w.tw || 560) + '" height="' + (w.th || 560) + '">' +
        '<span class="cap"><b>' + esc(w.title) + '</b><span>' + esc(w.meta) + '</span></span></button>';
    }).join('');
  }

  /* ---------- accueil ---------- */
  function initHome(cat) {
    var cc = $('#home-cats');
    if (cc) {
      cc.innerHTML = cat.categories.map(function (c) {
        var n = catCount(c);
        return '<a class="catcard" href="realisations.html#' + esc(c.id) + '"><span class="cover">' + coverImg(catCover(c)) + '</span>' +
          '<span class="cc-body"><b>' + esc(c.name) + '</b><span>' + esc(c.tagline) + '</span><em>' + plural(n, 'création', 'créations') + '</em></span></a>';
      }).join('');
    }
    var fw = $('#home-featured');
    if (fw) {
      var list = [], round = 0, added = true;
      while (list.length < 8 && added) {
        added = false;
        cat.categories.forEach(function (c) {
          c.subs.forEach(function (s) {
            if (list.length < 8 && s.works[round]) { list.push(s.works[round]); added = true; }
          });
        });
        round++;
      }
      fw.innerHTML = galleryHtml(list);
      workButtons(list, fw);
    }
  }

  /* ---------- services ---------- */
  function initServices(cat) {
    var root = $('#svc-root');
    root.innerHTML = cat.categories.map(function (c) {
      function renderRows(subs) {
        return '<ul class="svc-list">' + subs.map(function (s) {
          var n = s.works.length;
          return '<li><div><b>' + esc(s.name) + '</b><span>' + esc(s.desc) + '</span></div><div class="svc-meta"><strong>' + esc(s.price || 'Bientôt disponible') + '</strong>' +
            '<a href="realisations.html#' + esc(c.id) + '--' + esc(s.id) + '">' + (n ? plural(n, 'création', 'créations') : 'Bientôt') + '</a></div></li>';
        }).join('') + '</ul>';
      }
      var body = '';
      if (c.families && c.families.length) {
        body = c.families.map(function (f) {
          var grouped = c.subs.filter(function (s) { return s.familyId === f.id; });
          return '<section class="svc-family"><h3>' + esc(f.name) + '</h3>' + renderRows(grouped) + '</section>';
        }).join('') + renderRows(c.subs.filter(function (s) { return !s.familyId; }));
      } else body = renderRows(c.subs);
      var legacyAnchors = (c.aliases || []).map(function (alias) { return '<span class="legacy-anchor" id="' + esc(alias) + '" aria-hidden="true"></span>'; }).join('');
      return legacyAnchors + '<article class="svc-block" id="' + esc(c.id) + '"><div class="svc-head"><h2>' + esc(c.name) + '</h2><p>' + esc(c.tagline) + '</p>' +
        '<div class="svc-links"><a class="btn btn-s" href="tarifs.html#' + esc(c.id) + '">Voir les tarifs</a><a class="btn btn-s" href="realisations.html#' + esc(c.id) + '">Voir les réalisations</a></div></div>' + body + '</article>';
    }).join('');
  }

  /* ---------- réalisations : catégorie > subdivision > créations ---------- */
  function initReal(cat) {
    var root = $('#real-root');
    function find(id) { return cat.categories.filter(function (c) { return c.id === id || (c.aliases || []).indexOf(id) >= 0; })[0]; }
    function render() {
      var parts = location.hash.replace('#', '').split('--');
      var c = find(parts[0]);
      var s = c && parts[1] ? c.subs.filter(function (x) { return x.id === parts[1]; })[0] : null;
      var html = '';
      if (!c) {
        html = '<div class="catcards">' + cat.categories.map(function (k) {
          var n = catCount(k);
          return '<a class="catcard big" href="#' + esc(k.id) + '"><span class="cover">' + coverImg(catCover(k)) + '</span>' +
            '<span class="cc-body"><b>' + esc(k.name) + '</b><span>' + esc(k.tagline) + '</span><em>' + plural(k.subs.length, 'subdivision', 'subdivisions') + ' · ' + plural(n, 'création', 'créations') + '</em></span></a>';
        }).join('') + '</div>';
        root.innerHTML = html;
        return;
      }
      html += '<nav class="crumbs" aria-label="Fil d\'Ariane"><a href="#">Réalisations</a><span>/</span>' +
        (s ? '<a href="#' + esc(c.id) + '">' + esc(c.name) + '</a><span>/</span><b aria-current="page">' + esc(s.name) + '</b>' : '<b aria-current="page">' + esc(c.name) + '</b>') + '</nav>';
      html += '<div class="tabs lvl1" role="navigation" aria-label="Catégories">' + cat.categories.map(function (k) {
        return '<a class="tab" href="#' + esc(k.id) + '"' + (k.id === c.id ? ' aria-current="true"' : '') + '>' + esc(k.name) + '</a>';
      }).join('') + '</div>';
      if (!s) {
        html += '<div class="sec-title"><h2>' + esc(c.name) + '</h2><p>' + esc(c.tagline) + '</p></div>' +
          (function () {
            function cards(items) {
              return '<div class="subcards">' + items.map(function (x) {
                var n = x.works.length, inner = '<span class="cover">' + coverImg(x.works[0]) + '</span><span class="cc-body"><b>' + esc(x.name) + '</b><span>' + esc(x.desc) + '</span>' +
                  '<em>' + (n ? plural(n, 'création', 'créations') : 'Bientôt disponible') + ' · ' + esc(x.price || 'Bientôt disponible') + '</em></span>';
                return n ? '<a class="catcard" href="#' + esc(c.id) + '--' + esc(x.id) + '">' + inner + '</a>' : '<div class="catcard empty">' + inner + '</div>';
              }).join('') + '</div>';
            }
            if (c.families && c.families.length) return c.families.map(function (f) {
              return '<section class="real-family"><h3>' + esc(f.name) + '</h3>' + cards(c.subs.filter(function (x) { return x.familyId === f.id; })) + '</section>';
            }).join('') + cards(c.subs.filter(function (x) { return !x.familyId; }));
            return cards(c.subs);
          })();
        root.innerHTML = html;
        return;
      }
      html += '<div class="tabs lvl2" role="navigation" aria-label="Subdivisions de ' + esc(c.name) + '">' + c.subs.map(function (x) {
        return '<a class="chip" href="#' + esc(c.id) + '--' + esc(x.id) + '"' + (x.id === s.id ? ' aria-current="true"' : '') + '>' + esc(x.name) + ' <small>' + x.works.length + '</small></a>';
      }).join('') + '</div>';
      html += '<div class="sec-title"><h2>' + esc(s.name) + '</h2><p>' + esc(s.desc) + ' · <strong>' + esc(s.price) + '</strong></p></div>';
      if (s.works.length) {
        html += '<div class="gallery" id="real-gallery">' + galleryHtml(s.works) + '</div>';
      } else {
        html += '<div class="emptybox"><p>Les créations de cette subdivision seront publiées prochainement.</p><a class="btn btn-p" href="contact.html">Commander ce service</a></div>';
      }
      root.innerHTML = html;
      if (s.works.length) workButtons(s.works, $('#real-gallery'));
    }
    var lastKey = null;
    function onRoute() {
      var key = location.hash;
      render();
      if (lastKey !== null && key !== lastKey) {
        var top = $('#real-root').getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo(0, Math.max(0, top));
      }
      lastKey = key;
    }
    window.addEventListener('hashchange', onRoute);
    onRoute();
  }

  /* ---------- tarifs ---------- */
  function initTarifs(cat) {
    var root = $('#tarifs-root');
    var ids = cat.categories.map(function (c) { return c.id; });
    function priceHtml(t) {
      var pre = t[4] ? '<small>' + esc(t[4]) + '</small>' : '';
      return pre + esc(t[3]) + ' $' + (t[5] ? ' ' + esc(t[5]) : '');
    }
    function render() {
      var cur = location.hash.replace('#', '');
      var c = cat.categories.filter(function (x) { return x.id === cur || (x.aliases || []).indexOf(cur) >= 0; })[0];
      if (!c) c = cat.categories[0];
      cur = c ? c.id : '';
      var rows = cat.tariffs.filter(function (t) { return t[0] === cur; });
      var html = '<div class="tabs" role="navigation" aria-label="Catégories de tarifs">' + cat.categories.map(function (k) {
        return '<a class="tab" href="#' + esc(k.id) + '"' + (k.id === cur ? ' aria-current="true"' : '') + '>' + esc(k.name) + '</a>';
      }).join('') + '</div>';
      html += rows.length ? '<div class="price"><div class="prow ph" aria-hidden="true"><span>Service</span><span>Détail</span><span>Prix</span><span>Standard</span><span>Express</span></div>' +
        rows.map(function (t) {
          return '<div class="prow"><b>' + esc(t[1]) + '</b><span class="d">' + esc(t[2]) + '</span><span class="pr">' + priceHtml(t) + '</span>' +
            '<span class="t"><i>Standard </i>' + esc(t[6] || 'À définir') + '</span><span class="t"><i>Express </i>' + esc(t[7] || 'À définir') + '</span></div>';
        }).join('') + '</div>' : '<div class="emptybox"><p>Bientôt disponible. Les tarifs de cette catégorie seront publiés prochainement.</p></div>';
      html += '<div class="more"><a class="btn btn-s" href="realisations.html#' + esc(cur) + '">Voir les réalisations : ' + esc(c.name) + '</a><a class="btn btn-p" href="contact.html">Demander un devis</a></div>';
      root.innerHTML = html;
    }
    window.addEventListener('hashchange', render);
    render();
  }

  /* ---------- contact ---------- */
  function initContact() {
    var WA = CFG.whatsapp || '243892189581';
    var f = $('#form'), nom = $('#f-nom'), tel = $('#f-tel'), srv = $('#f-srv'), del = $('#f-del'), msg = $('#f-msg'), hp = $('#f-hp');
    var send = $('#f-send'), save = $('#f-save'), note = $('#f-note');
    var useDb = !!(CFG.supabaseUrl && CFG.supabaseKey && window.supabase);
    if (!useDb) save.hidden = true;
    function build() {
      return 'Bonjour Noor Communication,\n\nJe m\'appelle ' + nom.value.trim() + '.' +
        (tel.value.trim() ? '\nMon numéro : ' + tel.value.trim() : '') +
        '\nService : ' + srv.value + '\nDélai souhaité : ' + del.value + '\n\nMon projet :\n' + msg.value.trim();
    }
    function ok() { return nom.value.trim() && msg.value.trim(); }
    function refresh() {
      send.setAttribute('aria-disabled', ok() ? 'false' : 'true');
      send.href = ok() ? 'https://wa.me/' + WA + '?text=' + encodeURIComponent(build()) : '#';
    }
    [nom, tel, srv, del, msg].forEach(function (el) { el.addEventListener('input', refresh); el.addEventListener('change', refresh); });
    send.addEventListener('click', function (e) { if (send.getAttribute('aria-disabled') === 'true') e.preventDefault(); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!useDb) return;
      if (hp.value) return;
      if (!ok()) { note.textContent = 'Indiquez votre nom et décrivez votre projet.'; return; }
      save.setAttribute('aria-disabled', 'true'); note.textContent = 'Envoi en cours…';
      var sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey);
      sb.from('contact_messages').insert({ name: nom.value.trim(), email: null, phone: tel.value.trim() || null, subject: srv.value + ' — ' + del.value, message: msg.value.trim() })
        .then(function (r) {
          save.setAttribute('aria-disabled', 'false');
          if (r.error) { note.textContent = 'L\'envoi a échoué. Utilisez le bouton WhatsApp ou écrivez à lemabeni50@gmail.com.'; return; }
          f.reset(); refresh();
          note.textContent = 'Message envoyé. Nous vous répondons rapidement par WhatsApp ou par appel.';
        });
    });
    $('#f-copy').addEventListener('click', function () {
      var t = build();
      function fail() { msg.focus(); msg.select(); note.textContent = 'Copie impossible ici : sélectionnez le texte et copiez-le.'; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { note.textContent = 'Message copié. Collez-le dans WhatsApp ou dans un e-mail à lemabeni50@gmail.com.'; }, fail);
      } else fail();
    });
    refresh();
  }

  /* ---------- démarrage ---------- */
  var page = ($('[data-page]') || {}).dataset ? $('[data-page]').dataset.page : '';
  if (page === 'contact') initContact();
  if (page === 'home') loadCatalogue().then(initHome);
  if (page === 'services') loadCatalogue().then(initServices);
  if (page === 'realisations') loadCatalogue().then(initReal);
  if (page === 'tarifs') loadCatalogue().then(initTarifs);
})();
