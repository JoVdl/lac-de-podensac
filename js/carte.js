// ================================================================
// Carte interactive Leaflet — Zones & Postes de pêche
// ================================================================

// Coordonnées des zones (polygones) extraites du KML officiel du lac
const ZONES_COORDS = {
  1: [[44.6511958,-0.3409606],[44.6514944,-0.3416875],[44.651793,-0.3423393],[44.6509878,-0.3429642],[44.6508523,-0.3426732],[44.6507474,-0.342232],[44.6505452,-0.3414461]],
  2: [[44.651793,-0.3423393],[44.6518823,-0.3423664],[44.6519834,-0.3424012],[44.6520726,-0.3425481],[44.6521341,-0.3427111],[44.6522535,-0.3429631],[44.6523384,-0.3431167],[44.6524204,-0.3432824],[44.6512726,-0.3441245],[44.6511971,-0.3438774],[44.6511178,-0.3435578],[44.6509878,-0.3429642]],
  3: [[44.6512726,-0.3441245],[44.6524204,-0.3432824],[44.6525234,-0.3435368],[44.6526245,-0.3437621],[44.6527008,-0.3440237],[44.6527647,-0.3441564],[44.6527991,-0.3442369],[44.6515923,-0.34513],[44.651513,-0.3448994],[44.6514491,-0.3447492],[44.651431,-0.3445668]],
  4: [[44.6515923,-0.34513],[44.6527991,-0.3442369],[44.6529016,-0.3444461],[44.6529694,-0.3445319],[44.6530323,-0.3446097],[44.6531296,-0.3447344],[44.6532537,-0.3449678],[44.6532818,-0.3450522],[44.651955,-0.3460785],[44.6518481,-0.3457513],[44.6517718,-0.3455287],[44.651663,-0.3452336]],
  5: [[44.6536476,-0.3462904],[44.6521881,-0.3473299],[44.6521117,-0.3470271],[44.6520734,-0.3467002],[44.6519951,-0.3463826],[44.651955,-0.3460785],[44.6532818,-0.3450522],[44.6533463,-0.3452323],[44.6534032,-0.3454137],[44.6534738,-0.345702],[44.6535626,-0.3460002]],
  6: [[44.6536456,-0.346293],[44.6540026,-0.347229],[44.6540876,-0.3474811],[44.6541649,-0.3476609],[44.6524323,-0.3489751],[44.6523484,-0.3485064],[44.6522664,-0.3479707],[44.6521881,-0.3473299],[44.6525238,-0.3470907]],
};

// Zone "toutes pêches" (7ha) — carnassiers & pêche de rive
const ZONE_TOUTES_PECHES = [[44.6524323,-0.3489751],[44.653117,-0.3484538],[44.6541649,-0.3476609],[44.6542588,-0.3479179],[44.6543432,-0.3481695],[44.6544643,-0.3485657],[44.6545701,-0.3489888],[44.6547227,-0.3496566],[44.6549211,-0.3507509],[44.6550203,-0.3516038],[44.6551081,-0.3524407],[44.6551424,-0.3529825],[44.6550661,-0.3532186],[44.6548257,-0.35324],[44.6546693,-0.3532079],[44.6545128,-0.3530201],[44.6542609,-0.3527036],[44.6540358,-0.3524005],[44.6536771,-0.3519231],[44.6534834,-0.3517178],[44.6533508,-0.3514509],[44.6530608,-0.3508581],[44.6528717,-0.3502757],[44.6527496,-0.3499833],[44.6526447,-0.3498049],[44.6525741,-0.3495917]];

document.addEventListener('DOMContentLoaded', function () {
  if (!document.getElementById('lac-map')) return;
  if (typeof POSTES === 'undefined') return;

  // Mise à jour du compteur de disponibilités
  const availCount = POSTES.filter(p => p.disponible).length;
  const availEl = document.getElementById('available-count');
  if (availEl) availEl.textContent = availCount + '/10';

  // ── Initialisation de la carte ──────────────────────────────
  const center = window.LAC_CENTER || [44.6528, -0.3470];
  const zoom = window.LAC_ZOOM || 15;
  const map = L.map('lac-map', {
    center, zoom,
    zoomControl: true,
    scrollWheelZoom: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  // ── Zone "Toutes pêches" (fond, rendu en premier) ───────────
  L.polygon(ZONE_TOUTES_PECHES, {
    color: '#c47800',
    weight: 2,
    dashArray: '6 4',
    fillColor: '#e8951e',
    fillOpacity: 0.08,
  }).addTo(map).bindPopup(`
    <div style="font-family:'Inter',sans-serif;min-width:200px;">
      <strong style="font-family:'Montserrat',sans-serif;">🎣 Zone Toutes Pêches</strong><br>
      <span style="font-size:0.8rem;color:#6c7a89;">7 hectares · Carnassiers & pêche de rive</span><br>
      <p style="font-size:0.82rem;margin-top:8px;color:#2c3e50;">Zone dédiée aux spécialistes des carnassiers et à la pêche de rive. Navigation de barques autorisée.</p>
    </div>
  `);

  // ── Polygones des zones de pêche ────────────────────────────
  const polygonLayers = {};

  POSTES.forEach(poste => {
    const coords = ZONES_COORDS[poste.id];
    if (!coords) return;

    const isAvail = poste.disponible && !poste.coming_soon;
    const isSoon = poste.coming_soon;

    const fillColor = isSoon ? '#95a5a6' : isAvail ? '#3d8a80' : '#e74c3c';
    const borderColor = isSoon ? '#7f8c8d' : isAvail ? '#2a6059' : '#c0392b';
    const dashArray = isSoon ? '5 4' : null;

    const poly = L.polygon(coords, {
      color: borderColor,
      weight: 2.5,
      dashArray,
      fillColor,
      fillOpacity: 0.22,
      className: 'zone-polygon',
    }).addTo(map);

    // Hover effect
    poly.on('mouseover', function () {
      this.setStyle({ fillOpacity: 0.42, weight: 3.5 });
    });
    poly.on('mouseout', function () {
      this.setStyle({ fillOpacity: 0.22, weight: 2.5 });
    });
    poly.on('click', function () {
      openSpotModal(poste.id);
      highlightListItem(poste.id);
    });

    // Label centré sur la zone
    const centroid = coords.reduce((acc, c) => [acc[0]+c[0], acc[1]+c[1]], [0,0]).map(v => v / coords.length);
    const label = L.divIcon({
      html: `<div style="
        background:${isAvail ? '#2a6059' : isSoon ? '#7f8c8d' : '#c0392b'};
        color:#fff; width:30px; height:30px; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        font-family:'Montserrat',sans-serif; font-weight:800; font-size:0.8rem;
        border:2.5px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,0.3);
        cursor:pointer;
      ">${poste.id}</div>`,
      className: '', iconSize: [30,30], iconAnchor: [15,15],
    });
    L.marker(centroid, { icon: label }).addTo(map).on('click', () => {
      openSpotModal(poste.id);
      highlightListItem(poste.id);
    });

    polygonLayers[poste.id] = poly;
  });

  // ── Marqueurs pour postes 7-10 (sans zone polygone) ─────────
  POSTES.filter(p => !ZONES_COORDS[p.id]).forEach(poste => {
    const color = poste.disponible ? '#2a6059' : '#c0392b';
    const icon = L.divIcon({
      html: `<div style="
        background:${color}; color:#fff;
        width:36px; height:36px;
        border-radius:50% 50% 50% 0; transform:rotate(-45deg);
        display:flex; align-items:center; justify-content:center;
        box-shadow:0 3px 12px rgba(0,0,0,0.35); border:3px solid #fff;
        font-family:'Montserrat',sans-serif; font-weight:800; font-size:0.8rem;
      "><span style="transform:rotate(45deg);">${poste.id}</span></div>`,
      className: '', iconSize: [36,36], iconAnchor: [18,36], popupAnchor: [0,-38],
    });
    L.marker([poste.lat, poste.lng], { icon }).addTo(map)
      .bindPopup(`
        <div style="font-family:'Inter',sans-serif;min-width:200px;">
          <strong style="font-family:'Montserrat',sans-serif;">${poste.icon} ${poste.nom}</strong><br>
          <span style="font-size:0.78rem;color:#6c7a89;">${poste.poissons.slice(0,3).join(' · ')}</span><br>
          <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:0.78rem;color:${poste.disponible?'#27ae60':'#e74c3c'};font-weight:700;">${poste.disponible?'✓ Disponible':'● Complet'}</span>
            <strong style="font-size:1rem;color:#3d8a80;">${poste.prix_jour}€<span style="font-weight:400;font-size:0.75rem;">/jour</span></strong>
          </div>
          <button onclick="openSpotModal(${poste.id})" style="margin-top:8px;width:100%;padding:8px;background:#3d8a80;color:#fff;border:none;border-radius:8px;font-family:'Montserrat',sans-serif;font-weight:600;font-size:0.8rem;cursor:pointer;">
            Voir détails & Réserver →
          </button>
        </div>
      `, { maxWidth: 240 })
      .on('click', () => { openSpotModal(poste.id); highlightListItem(poste.id); });
  });

  // ── Marqueurs équipements ────────────────────────────────────
  if (typeof AMENITIES !== 'undefined') {
    AMENITIES.forEach(a => {
      const icon = L.divIcon({
        html: `<div style="background:#fff;border:2px solid #3d8a80;border-radius:8px;padding:3px 5px;font-size:0.9rem;box-shadow:0 2px 8px rgba(0,0,0,0.2);">${a.icon}</div>`,
        className: '', iconSize: [30,30], iconAnchor: [15,15], popupAnchor: [0,-16],
      });
      L.marker([a.lat, a.lng], { icon }).addTo(map)
        .bindPopup(`<strong>${a.icon} ${a.nom}</strong><br><span style="font-size:0.8rem;color:#6c7a89;">${a.desc}</span>`);
    });
  }

  // ── Highlight zone au clic ───────────────────────────────────
  function highlightZone(id) {
    Object.entries(polygonLayers).forEach(([pid, layer]) => {
      const isTarget = parseInt(pid) === id;
      layer.setStyle({ weight: isTarget ? 4 : 2.5, fillOpacity: isTarget ? 0.45 : 0.22 });
      if (isTarget) layer.bringToFront();
    });
  }

  // ── Sidebar : liste des postes ───────────────────────────────
  function renderList(filter = 'all') {
    const container = document.getElementById('spots-list');
    if (!container) return;
    container.innerHTML = '';

    const filtered = POSTES.filter(p => {
      if (filter === 'available') return p.disponible && !p.coming_soon;
      if (filter === 'carpe') return p.poissons.some(f => f.toLowerCase().includes('carpe'));
      if (filter === 'brochet') return p.poissons.some(f => f.toLowerCase().includes('brochet') || f.toLowerCase().includes('sandre'));
      if (filter === 'facile') return p.difficulte === 'Facile';
      if (filter === 'premium') return p.premium;
      return true;
    });

    filtered.forEach(p => {
      const item = document.createElement('div');
      item.className = `map-spot-item ${p.disponible && !p.coming_soon ? 'available' : 'busy'}`;
      item.id = `list-item-${p.id}`;
      item.innerHTML = `
        <div class="map-spot-item__header">
          <div class="map-spot-item__num">${p.id}</div>
          <div>
            <div class="map-spot-item__name">${p.nom}${p.coming_soon ? ' <span style="font-size:0.65rem;background:#95a5a6;color:#fff;padding:1px 6px;border-radius:4px;vertical-align:middle;">Bientôt</span>' : ''}</div>
            <div class="map-spot-item__fish">${p.poissons.slice(0,2).join(' · ')}</div>
          </div>
        </div>
        <div class="map-spot-item__meta">
          <div class="map-spot-item__price">${p.prix_jour}€<small style="font-weight:400;color:#6c7a89;font-size:0.72rem;">/j</small></div>
          <span class="map-spot-item__avail ${p.disponible && !p.coming_soon ? 'available' : 'busy'}">
            ${p.coming_soon ? '🚧 Bientôt' : p.disponible ? '✓ Dispo' : '● Complet'}
          </span>
        </div>
      `;
      item.addEventListener('click', () => {
        openSpotModal(p.id);
        highlightZone(p.id);
        highlightListItem(p.id);
        // Centrer sur la zone
        const coords = ZONES_COORDS[p.id];
        if (coords) {
          const bounds = L.latLngBounds(coords);
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
        } else {
          map.setView([p.lat, p.lng], 16, { animate: true });
        }
      });
      container.appendChild(item);
    });
  }

  function highlightListItem(id) {
    document.querySelectorAll('.map-spot-item').forEach(el => el.classList.remove('selected'));
    const el = document.getElementById(`list-item-${id}`);
    if (el) { el.classList.add('selected'); el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  }

  renderList();

  document.querySelectorAll('#map-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#map-filters .filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderList(this.dataset.filter);
    });
  });

  // ── Grille liste complète ────────────────────────────────────
  const allGrid = document.getElementById('all-spots-grid');
  function renderAllGrid(species = 'all') {
    if (!allGrid) return;
    allGrid.innerHTML = '';
    const filtered = species === 'all' ? POSTES : POSTES.filter(p =>
      p.poissons.some(f => f.toLowerCase().includes(species.toLowerCase()))
    );
    filtered.forEach(p => {
      const avail = p.disponible && !p.coming_soon ? 'available' : 'busy';
      const avlbl = p.coming_soon ? '🚧 Bientôt' : p.disponible ? '✓ Disponible' : '● Complet';
      const card = document.createElement('div');
      card.className = 'spot-card fade-up';
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div class="spot-card__header" style="background:linear-gradient(135deg,#2a6059,#3d8a80);">
          <span class="spot-card__number">${p.id}</span>
          <span class="spot-card__avail ${avail}">${avlbl}</span>
          <div class="spot-card__illustration" style="font-size:2rem;">${p.icon}</div>
          ${p.premium ? '<div style="position:absolute;bottom:12px;left:16px;background:var(--accent);color:#fff;font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:50px;">⭐ PREMIUM</div>' : ''}
          ${p.coming_soon ? '<div style="position:absolute;bottom:12px;left:16px;background:#7f8c8d;color:#fff;font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:50px;">🚧 BIENTÔT</div>' : ''}
        </div>
        <div class="spot-card__body">
          <div class="spot-card__name">${p.nom}</div>
          <div style="font-size:0.8rem;color:var(--gray);margin-bottom:8px;">${p.difficulte} · ${p.profondeur} · ${p.capacite} pers. max${p.zone_ha ? ` · ${p.zone_ha} ha` : ''}</div>
          <div class="spot-card__fish">${p.poissons.slice(0,4).map(f => `<span class="fish-tag">${f}</span>`).join('')}</div>
          <div class="spot-card__meta">
            <div class="spot-card__rating"><span class="stars">★</span> ${p.score} <span>(${p.avis} avis)</span></div>
            <div class="spot-card__price">${p.prix_jour}€ <small>/ jour</small></div>
          </div>
        </div>
      `;
      card.addEventListener('click', () => {
        openSpotModal(p.id);
        if (window.innerWidth > 900) {
          document.getElementById('carte').scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => {
            highlightZone(p.id);
            const coords = ZONES_COORDS[p.id];
            if (coords) map.fitBounds(L.latLngBounds(coords), { padding: [40,40], maxZoom: 17 });
          }, 600);
        }
      });
      allGrid.appendChild(card);
    });
    document.querySelectorAll('.fade-up').forEach(el => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
      }, { threshold: 0.1 });
      obs.observe(el);
    });
  }
  renderAllGrid();

  document.querySelectorAll('#species-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#species-filters .filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderAllGrid(this.dataset.species);
    });
  });

  // ── Modal détail poste ───────────────────────────────────────
  window.openSpotModal = function (id) {
    const p = POSTES.find(x => x.id === id);
    if (!p) return;

    document.getElementById('modal-title').textContent = `${p.icon} ${p.nom}`;
    document.getElementById('modal-badge').innerHTML = `
      Poste #${p.id} · ${p.zone_ha ? p.zone_ha + ' ha · ' : ''}
      <span style="color:${p.disponible && !p.coming_soon ? '#7ecfa0' : '#f0a09a'};">
        ${p.coming_soon ? '🚧 En cours d\'aménagement' : p.disponible ? '✓ Disponible' : '● Complet'}
      </span>
      ${p.premium ? ' · ⭐ Premium' : ''}
    `;

    const body = document.getElementById('modal-body');
    body.innerHTML = `
      <div class="modal__section">
        <p style="color:var(--gray-dark);line-height:1.8;">${p.description}</p>
        ${p.note ? `<div style="margin-top:10px;padding:10px 14px;background:rgba(61,138,128,0.08);border-radius:8px;font-size:0.82rem;color:var(--primary);border-left:3px solid var(--primary-light);">📋 ${p.note}</div>` : ''}
      </div>
      <div class="modal__section">
        <div class="modal__section-title">Caractéristiques</div>
        <div class="modal__detail-grid">
          <div class="modal__detail-item"><div class="modal__detail-label">Difficulté</div><div class="modal__detail-value" style="color:${getDiffColor(p.difficulte)};">${p.difficulte}</div></div>
          <div class="modal__detail-item"><div class="modal__detail-label">Profondeur</div><div class="modal__detail-value">${p.profondeur}</div></div>
          <div class="modal__detail-item"><div class="modal__detail-label">Fond</div><div class="modal__detail-value">${p.fond}</div></div>
          <div class="modal__detail-item"><div class="modal__detail-label">Capacité</div><div class="modal__detail-value">${p.capacite} pêcheur${p.capacite>1?'s':''}</div></div>
          <div class="modal__detail-item"><div class="modal__detail-label">Note</div><div class="modal__detail-value">⭐ ${p.score}/5 (${p.avis} avis)</div></div>
          <div class="modal__detail-item"><div class="modal__detail-label">PMR</div><div class="modal__detail-value">${p.acces_pmr?'✓ Accessible':'✗ Non accessible'}</div></div>
        </div>
      </div>
      <div class="modal__section">
        <div class="modal__section-title">Espèces présentes</div>
        <div class="modal__fish-tags">${p.poissons.map(f=>`<div class="modal__fish-tag">🐟 ${f}</div>`).join('')}</div>
      </div>
      <div class="modal__section">
        <div class="modal__section-title">Captures récentes</div>
        <div class="modal__catches">
          ${p.captures.map(c=>`<div class="modal__catch"><span>${c.emoji}</span><div class="modal__catch-info">${c.espece} · ${c.poids}<br><span style="font-size:0.6rem;opacity:0.7;">${c.date}</span></div></div>`).join('')}
        </div>
      </div>
      <div class="modal__section">
        <div class="modal__section-title">Équipements inclus</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">${p.equipements.map(e=>`<span style="background:var(--gray-bg);padding:6px 12px;border-radius:8px;font-size:0.8rem;color:var(--gray-dark);">✓ ${e}</span>`).join('')}</div>
      </div>
      <div class="modal__section">
        <div class="modal__section-title">Tarifs</div>
        <div class="modal__pricing">
          <div class="modal__price-card"><div class="modal__price-label">Journée (6h–20h)</div><div class="modal__price-amount">${p.prix_jour}€<span>/session</span></div><div class="modal__price-note">jusqu'à ${p.capacite} pêcheur${p.capacite>1?'s':''}</div></div>
          <div class="modal__price-card featured"><div class="modal__price-label">Nuit (20h–8h)</div><div class="modal__price-amount">${p.prix_nuit}€<span>/session</span></div><div class="modal__price-note">Bivouac autorisé</div></div>
          <div class="modal__price-card"><div class="modal__price-label">24 heures</div><div class="modal__price-amount">${p.prix_24h}€<span>/session</span></div><div class="modal__price-note">Meilleur rapport</div></div>
        </div>
      </div>
      <div style="display:flex;gap:12px;margin-top:4px;flex-wrap:wrap;">
        ${p.disponible && !p.coming_soon
          ? `<button onclick="selectPosteAndBook(${p.id});closeModal();" class="btn btn--success btn--lg" style="flex:1;justify-content:center;">📅 Réserver ce poste</button>`
          : `<button class="btn btn--lg" style="flex:1;justify-content:center;background:#6c7a89;color:#fff;cursor:not-allowed;" disabled>${p.coming_soon ? '🚧 Ouverture prochaine' : '● Complet — Liste d\'attente'}</button>`
        }
        <button onclick="closeModal();const z=ZONES_COORDS[${p.id}];if(z){const b=L.latLngBounds(z);window._leafletMap.fitBounds(b,{padding:[40,40],maxZoom:17});}document.getElementById('carte').scrollIntoView({behavior:'smooth'});" class="btn btn--outline-dark btn--lg">🗺️ Voir sur la carte</button>
      </div>
    `;
    document.getElementById('modal-overlay').classList.add('open');
  };

  window.closeModal = function () {
    document.getElementById('modal-overlay').classList.remove('open');
  };
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', function(e) { if(e.target===this) closeModal(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });

  window.selectPosteAndBook = function(id) {
    const select = document.getElementById('f-poste');
    if (select) { select.value=id; select.dispatchEvent(new Event('change')); document.getElementById('reservation').scrollIntoView({behavior:'smooth'}); }
  };

  window._leafletMap = map;
});
