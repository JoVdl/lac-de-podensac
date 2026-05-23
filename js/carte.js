// ================================================================
// Carte interactive Leaflet — Postes de pêche
// ================================================================

document.addEventListener('DOMContentLoaded', function () {
  if (!document.getElementById('lac-map')) return;
  if (typeof POSTES === 'undefined') return;

  // Mise à jour du compteur de disponibilités
  const availCount = POSTES.filter(p => p.disponible).length;
  const availEl = document.getElementById('available-count');
  if (availEl) availEl.textContent = availCount + '/12';

  // ── Initialisation de la carte ──────────────────────────────
  const center = window.LAC_CENTER || [44.6528, -0.3470];
  const zoom = window.LAC_ZOOM || 15;
  const map = L.map('lac-map', {
    center,
    zoom,
    zoomControl: true,
    scrollWheelZoom: true,
  });

  // Fond de carte OpenStreetMap (style clair)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  // ── Marqueurs personnalisés ──────────────────────────────────
  function createMarkerIcon(poste) {
    const color = poste.disponible ? '#27ae60' : '#e74c3c';
    const premium = poste.premium ? '⭐' : poste.id;
    const html = `
      <div style="
        background:${color};
        color:#fff;
        width:36px;height:36px;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 3px 12px rgba(0,0,0,0.35);
        border:3px solid #fff;
        font-family:'Montserrat',sans-serif;
        font-weight:800;font-size:0.8rem;
      ">
        <span style="transform:rotate(45deg);">${premium}</span>
      </div>`;
    return L.divIcon({
      html,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -38],
    });
  }

  // ── Ajout des marqueurs ──────────────────────────────────────
  const markers = {};
  POSTES.forEach(poste => {
    const marker = L.marker([poste.lat, poste.lng], { icon: createMarkerIcon(poste) })
      .addTo(map);

    // Popup léger au survol
    marker.bindPopup(`
      <div style="font-family:'Inter',sans-serif;min-width:200px;">
        <strong style="font-family:'Montserrat',sans-serif;font-size:0.95rem;">${poste.icon} Poste #${poste.id} — ${poste.nom}</strong><br>
        <span style="font-size:0.78rem;color:#6c7a89;">${poste.poissons.slice(0,3).join(' · ')}</span><br>
        <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.78rem;color:${poste.disponible ? '#27ae60' : '#e74c3c'};font-weight:700;">
            ${poste.disponible ? '✓ Disponible' : '● Complet'}
          </span>
          <strong style="font-size:1rem;color:#0d4f6e;">${poste.prix_jour}€<span style="font-weight:400;font-size:0.75rem;">/jour</span></strong>
        </div>
        <button onclick="openSpotModal(${poste.id})" style="
          margin-top:8px;width:100%;padding:8px;
          background:#0d4f6e;color:#fff;border:none;border-radius:8px;
          font-family:'Montserrat',sans-serif;font-weight:600;font-size:0.8rem;cursor:pointer;
        ">Voir détails & Réserver →</button>
      </div>
    `, { maxWidth: 240 });

    // Clic → ouvrir la modal
    marker.on('click', function () {
      openSpotModal(poste.id);
      // Mettre en évidence dans la liste
      highlightListItem(poste.id);
    });

    markers[poste.id] = marker;
  });

  // ── Marqueurs équipements ────────────────────────────────────
  if (typeof AMENITIES !== 'undefined') {
    AMENITIES.forEach(a => {
      const icon = L.divIcon({
        html: `<div style="background:#fff;border:2px solid #0d4f6e;border-radius:8px;padding:4px 6px;font-size:1rem;box-shadow:0 2px 8px rgba(0,0,0,0.2);white-space:nowrap;">${a.icon}</div>`,
        className: '', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -34],
      });
      L.marker([a.lat, a.lng], { icon }).addTo(map)
        .bindPopup(`<strong>${a.icon} ${a.nom}</strong><br><span style="font-size:0.8rem;color:#6c7a89;">${a.desc}</span>`);
    });
  }

  // ── Sidebar : liste des postes ───────────────────────────────
  function renderList(filter = 'all') {
    const container = document.getElementById('spots-list');
    if (!container) return;
    container.innerHTML = '';

    const filtered = POSTES.filter(p => {
      if (filter === 'available') return p.disponible;
      if (filter === 'carpe') return p.poissons.some(f => f.toLowerCase().includes('carpe'));
      if (filter === 'brochet') return p.poissons.some(f => f.toLowerCase().includes('brochet') || f.toLowerCase().includes('sandre'));
      if (filter === 'facile') return p.difficulte === 'Facile';
      if (filter === 'premium') return p.premium;
      return true;
    });

    filtered.forEach(p => {
      const item = document.createElement('div');
      item.className = `map-spot-item ${p.disponible ? 'available' : 'busy'}`;
      item.id = `list-item-${p.id}`;
      item.innerHTML = `
        <div class="map-spot-item__header">
          <div class="map-spot-item__num">${p.id}</div>
          <div>
            <div class="map-spot-item__name">${p.nom}</div>
            <div class="map-spot-item__fish">${p.poissons.slice(0,2).join(' · ')}</div>
          </div>
        </div>
        <div class="map-spot-item__meta">
          <div class="map-spot-item__price">${p.prix_jour}€<small style="font-weight:400;color:#6c7a89;font-size:0.72rem;">/j</small></div>
          <span class="map-spot-item__avail ${p.disponible ? 'available' : 'busy'}">
            ${p.disponible ? '✓ Dispo' : '● Complet'}
          </span>
        </div>
      `;
      item.addEventListener('click', () => {
        openSpotModal(p.id);
        map.setView([p.lat, p.lng], 16, { animate: true });
        markers[p.id].openPopup();
        highlightListItem(p.id);
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

  // Filtres
  document.querySelectorAll('#map-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#map-filters .filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderList(this.dataset.filter);
    });
  });

  // ── Grille de tous les postes ───────────────────────────────
  const allGrid = document.getElementById('all-spots-grid');
  function renderAllGrid(species = 'all') {
    if (!allGrid) return;
    allGrid.innerHTML = '';
    const filtered = species === 'all' ? POSTES : POSTES.filter(p =>
      p.poissons.some(f => f.toLowerCase().includes(species.toLowerCase()))
    );
    filtered.forEach(p => {
      const avail = p.disponible ? 'available' : 'busy';
      const avlbl = p.disponible ? '✓ Disponible' : '● Complet';
      const card = document.createElement('div');
      card.className = 'spot-card fade-up';
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div class="spot-card__header" style="background:linear-gradient(135deg,#0d4f6e,#1a7aa0);">
          <span class="spot-card__number">${p.id}</span>
          <span class="spot-card__avail ${avail}">${avlbl}</span>
          <div class="spot-card__illustration" style="font-size:2rem;">${p.icon}</div>
          ${p.premium ? '<div style="position:absolute;bottom:12px;left:16px;background:var(--accent);color:#fff;font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:50px;">⭐ PREMIUM</div>' : ''}
        </div>
        <div class="spot-card__body">
          <div class="spot-card__name">${p.nom}</div>
          <div style="font-size:0.8rem;color:var(--gray);margin-bottom:8px;">${p.difficulte} · ${p.profondeur} · ${p.capacite} pers. max</div>
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
        }
      });
      allGrid.appendChild(card);
    });
    // Ré-observer les fade-up
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
      Poste #${p.id} &nbsp;·&nbsp;
      <span style="color:${p.disponible ? '#7ecfa0' : '#f0a09a'};">${p.disponible ? '✓ Disponible' : '● Complet'}</span>
      ${p.premium ? ' &nbsp;·&nbsp; ⭐ Premium' : ''}
    `;

    const body = document.getElementById('modal-body');
    body.innerHTML = `
      <div class="modal__section">
        <p style="color:var(--gray-dark);line-height:1.8;">${p.description}</p>
      </div>
      <div class="modal__section">
        <div class="modal__section-title">Caractéristiques</div>
        <div class="modal__detail-grid">
          <div class="modal__detail-item"><div class="modal__detail-label">Difficulté</div><div class="modal__detail-value" style="color:${getDiffColor(p.difficulte)};">${p.difficulte}</div></div>
          <div class="modal__detail-item"><div class="modal__detail-label">Profondeur</div><div class="modal__detail-value">${p.profondeur}</div></div>
          <div class="modal__detail-item"><div class="modal__detail-label">Fond</div><div class="modal__detail-value">${p.fond}</div></div>
          <div class="modal__detail-item"><div class="modal__detail-label">Capacité</div><div class="modal__detail-value">${p.capacite} pêcheur${p.capacite > 1 ? 's' : ''}</div></div>
          <div class="modal__detail-item"><div class="modal__detail-label">Note</div><div class="modal__detail-value">⭐ ${p.score}/5 (${p.avis} avis)</div></div>
          <div class="modal__detail-item"><div class="modal__detail-label">PMR</div><div class="modal__detail-value">${p.acces_pmr ? '✓ Accessible' : '✗ Non accessible'}</div></div>
        </div>
      </div>
      <div class="modal__section">
        <div class="modal__section-title">Espèces présentes</div>
        <div class="modal__fish-tags">${p.poissons.map(f => `<div class="modal__fish-tag">🐟 ${f}</div>`).join('')}</div>
      </div>
      <div class="modal__section">
        <div class="modal__section-title">Captures récentes</div>
        <div class="modal__catches">
          ${p.captures.map(c => `
            <div class="modal__catch">
              <span>${c.emoji}</span>
              <div class="modal__catch-info">${c.espece} · ${c.poids}</div>
            </div>`).join('')}
        </div>
      </div>
      <div class="modal__section">
        <div class="modal__section-title">Équipements inclus</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${p.equipements.map(e => `<span style="background:var(--gray-bg);padding:6px 12px;border-radius:8px;font-size:0.8rem;color:var(--gray-dark);">✓ ${e}</span>`).join('')}
        </div>
      </div>
      <div class="modal__section" id="modal-pricing">
        <div class="modal__section-title">Tarifs</div>
        <div class="modal__pricing">
          <div class="modal__price-card">
            <div class="modal__price-label">Journée (6h–20h)</div>
            <div class="modal__price-amount">${p.prix_jour}€<span>/session</span></div>
            <div class="modal__price-note">jusqu'à ${p.capacite} pêcheur${p.capacite>1?'s':''}</div>
          </div>
          <div class="modal__price-card featured">
            <div class="modal__price-label">Nuit (20h–8h)</div>
            <div class="modal__price-amount">${p.prix_nuit}€<span>/session</span></div>
            <div class="modal__price-note">Bivouac autorisé</div>
          </div>
          <div class="modal__price-card">
            <div class="modal__price-label">24 heures</div>
            <div class="modal__price-amount">${p.prix_24h}€<span>/session</span></div>
            <div class="modal__price-note">Meilleur rapport qualité/prix</div>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:12px;margin-top:4px;flex-wrap:wrap;">
        ${p.disponible
          ? `<button onclick="selectPosteAndBook(${p.id});closeModal();" class="btn btn--success btn--lg" style="flex:1;justify-content:center;">📅 Réserver ce poste</button>`
          : `<button class="btn btn--lg" style="flex:1;justify-content:center;background:#6c7a89;color:#fff;cursor:not-allowed;" disabled>● Complet — Liste d'attente</button>`
        }
        <button onclick="map.setView([${p.lat},${p.lng}],17);closeModal();document.getElementById('carte').scrollIntoView({behavior:'smooth'});" class="btn btn--outline-dark btn--lg">🗺️ Voir sur la carte</button>
      </div>
    `;

    document.getElementById('modal-overlay').classList.add('open');
  };

  window.closeModal = function () {
    document.getElementById('modal-overlay').classList.remove('open');
  };

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Sélectionner poste pour réservation
  window.selectPosteAndBook = function (id) {
    const select = document.getElementById('f-poste');
    if (select) {
      select.value = id;
      select.dispatchEvent(new Event('change'));
      document.getElementById('reservation').scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Exposer la map globalement pour usage dans la modal
  window._leafletMap = map;
});
