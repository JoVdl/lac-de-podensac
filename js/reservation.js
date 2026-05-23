// ================================================================
// Système de réservation — pêche & bateau
// ================================================================

document.addEventListener('DOMContentLoaded', function () {

  // ── Peuplement du select des postes ──────────────────────────
  const posteSelect = document.getElementById('f-poste');
  if (posteSelect && typeof POSTES !== 'undefined') {
    POSTES.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `#${p.id} — ${p.nom} (${p.disponible ? '✓ Disponible' : '● Complet'})`;
      if (!p.disponible) opt.disabled = true;
      posteSelect.appendChild(opt);
    });
  }

  // ── Mise à jour du récapitulatif ──────────────────────────────
  function updateSummary() {
    const posteId = parseInt(document.getElementById('f-poste')?.value);
    const formule = document.querySelector('input[name="formule"]:checked')?.value;
    const duree = parseInt(document.getElementById('f-duree')?.value || 1);
    const nb = parseInt(document.getElementById('f-nb')?.value || 1);
    const date = document.getElementById('f-date-debut')?.value;

    const poste = typeof POSTES !== 'undefined' ? POSTES.find(p => p.id === posteId) : null;

    const sumPoste = document.getElementById('sum-poste');
    const sumFormule = document.getElementById('sum-formule');
    const sumDate = document.getElementById('sum-date');
    const sumDuree = document.getElementById('sum-duree');
    const sumNb = document.getElementById('sum-nb');
    const sumTotal = document.getElementById('sum-total');
    const priceJour = document.getElementById('price-jour');
    const priceNuit = document.getElementById('price-nuit');
    const price24h = document.getElementById('price-24h');

    if (poste) {
      if (sumPoste) sumPoste.textContent = `#${poste.id} ${poste.nom}`;
      if (priceJour) priceJour.textContent = `${poste.prix_jour}€`;
      if (priceNuit) priceNuit.textContent = `${poste.prix_nuit}€`;
      if (price24h) price24h.textContent = `${poste.prix_24h}€`;
    } else {
      if (sumPoste) sumPoste.textContent = '—';
    }

    const formuleLabels = { 'jour': 'Journée', 'nuit': 'Nuit', '24h': '24 heures' };
    if (sumFormule) sumFormule.textContent = formuleLabels[formule] || '—';
    if (sumDate) sumDate.textContent = date ? formatDateFR(date) : '—';
    if (sumDuree) sumDuree.textContent = `${duree} session${duree > 1 ? 's' : ''}`;
    if (sumNb) sumNb.textContent = `${nb} pêcheur${nb > 1 ? 's' : ''}`;

    if (poste && formule) {
      const unitPrice = formule === 'jour' ? poste.prix_jour : formule === 'nuit' ? poste.prix_nuit : poste.prix_24h;
      const total = unitPrice * duree;
      if (sumTotal) sumTotal.textContent = `${total}€`;
    } else {
      if (sumTotal) sumTotal.textContent = '—';
    }
  }

  ['f-poste', 'f-duree', 'f-nb', 'f-date-debut'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateSummary);
  });
  document.querySelectorAll('input[name="formule"]').forEach(r => r.addEventListener('change', updateSummary));

  // Date minimum = aujourd'hui
  const dateInput = document.getElementById('f-date-debut');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
    updateSummary();
  }

  // ── Soumission du formulaire de pêche ─────────────────────────
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const prenom = document.getElementById('f-prenom').value.trim();
      const nom = document.getElementById('f-nom').value.trim();
      const email = document.getElementById('f-email').value.trim();
      const tel = document.getElementById('f-tel').value.trim();
      const posteId = parseInt(document.getElementById('f-poste').value);
      const formule = document.querySelector('input[name="formule"]:checked')?.value;
      const dateDebut = document.getElementById('f-date-debut').value;
      const duree = parseInt(document.getElementById('f-duree').value);
      const nb = parseInt(document.getElementById('f-nb').value);
      const message = document.getElementById('f-message')?.value;

      if (!prenom || !nom || !email || !tel || !posteId || !formule || !dateDebut) {
        showToast('Veuillez remplir tous les champs obligatoires.', 'error', '⚠️');
        return;
      }

      const poste = POSTES.find(p => p.id === posteId);
      if (!poste) return;

      // Générer les dates
      const dates = [];
      const d = new Date(dateDebut);
      for (let i = 0; i < duree; i++) {
        dates.push(new Date(d.getTime() + i * 86400000).toISOString().split('T')[0]);
      }

      const booking = {
        type: 'peche',
        posteId, prenom, nom, email, tel, formule, dateDebut, duree, nb, message, dates,
      };

      BookingSystem.saveBooking(booking);

      const formuleLabels = { 'jour': 'Journée', 'nuit': 'Nuit', '24h': '24h' };
      const unitPrice = formule === 'jour' ? poste.prix_jour : formule === 'nuit' ? poste.prix_nuit : poste.prix_24h;
      const total = unitPrice * duree;

      showToast(`✓ Réservation confirmée ! Poste #${posteId} — ${poste.nom} — ${total}€. Email de confirmation envoyé à ${email}.`, 'success', '🎣');
      bookingForm.reset();
      if (dateInput) { dateInput.value = new Date().toISOString().split('T')[0]; }
      updateSummary();
      renderCalendar();
    });
  }

  // ── Calendrier ────────────────────────────────────────────────
  let calendarDate = new Date();
  const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  function renderCalendar() {
    const grid = document.getElementById('cal-grid');
    const label = document.getElementById('cal-month-label');
    if (!grid || !label) return;

    label.textContent = `${MOIS[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`;
    grid.innerHTML = '';

    // En-têtes jours
    JOURS.forEach(j => {
      const d = document.createElement('div');
      d.className = 'calendar-day-name';
      d.textContent = j;
      grid.appendChild(d);
    });

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Décalage (lundi = 0)
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const today = new Date().toISOString().split('T')[0];
    const selectedPoste = parseInt(document.getElementById('f-poste')?.value);
    const bookedDates = selectedPoste && typeof BookingSystem !== 'undefined'
      ? BookingSystem.getBookedDates(selectedPoste) : [];
    const selectedDate = document.getElementById('f-date-debut')?.value;

    // Cases vides début
    for (let i = 0; i < startDow; i++) {
      const blank = document.createElement('div');
      blank.className = 'calendar-day other-month';
      grid.appendChild(blank);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      cell.textContent = d;

      if (dateStr === today) cell.classList.add('today');
      if (bookedDates.includes(dateStr)) {
        cell.classList.add('booked');
        cell.title = 'Déjà réservé';
      } else if (dateStr === selectedDate) {
        cell.classList.add('selected');
      } else if (dateStr >= today) {
        cell.classList.add('available');
        cell.addEventListener('click', () => {
          const di = document.getElementById('f-date-debut');
          if (di) { di.value = dateStr; di.dispatchEvent(new Event('change')); renderCalendar(); }
        });
      }
      grid.appendChild(cell);
    }
  }

  const calPrev = document.getElementById('cal-prev');
  const calNext = document.getElementById('cal-next');
  if (calPrev) calPrev.addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(); });
  if (calNext) calNext.addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(); });

  renderCalendar();

  // Rafraîchir le calendrier quand le poste change
  const posteSelectEl = document.getElementById('f-poste');
  if (posteSelectEl) posteSelectEl.addEventListener('change', renderCalendar);

  // ── Soumission formulaire bateau ──────────────────────────────
  const boatForm = document.getElementById('boat-booking-form');
  if (boatForm) {
    boatForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const prenom = document.getElementById('bf-prenom')?.value.trim();
      const nom = document.getElementById('bf-nom')?.value.trim();
      const email = document.getElementById('bf-email')?.value.trim();
      const tel = document.getElementById('bf-tel')?.value.trim();
      const bateau = document.getElementById('bf-bateau')?.value;
      const formule = document.querySelector('input[name="bformule"]:checked')?.value;
      const date = document.getElementById('bf-date')?.value;
      const heure = document.getElementById('bf-heure')?.value;
      const nb = document.getElementById('bf-nb')?.value;

      if (!prenom || !nom || !email || !tel || !bateau || !formule || !date) {
        showToast('Veuillez remplir tous les champs obligatoires.', 'error', '⚠️');
        return;
      }

      const prix = { 'aperitif': 35, 'soiree': 65, 'journee': 95 };
      const total = prix[formule] * parseInt(nb);
      const labels = { 'aperitif': 'Apéritif (2h)', 'soiree': 'Soirée BBQ (3h30)', 'journee': 'Journée (6h)' };

      const booking = { type: 'bateau', prenom, nom, email, tel, bateau, formule, date, heure, nb };
      BookingSystem.saveBooking(booking);

      showToast(`🔥 Réservation bateau confirmée ! ${labels[formule]} — ${total}€ pour ${nb} pers. Email envoyé à ${email}.`, 'success', '🔥');
      boatForm.reset();
      const bdate = document.getElementById('bf-date');
      if (bdate) bdate.min = new Date().toISOString().split('T')[0];
    });

    const bdateInput = document.getElementById('bf-date');
    if (bdateInput) bdateInput.min = new Date().toISOString().split('T')[0];
  }

  // Mise à jour récapitulatif bateau
  function updateBoatSummary() {
    const nb = parseInt(document.getElementById('bf-nb')?.value || 2);
    const formule = document.querySelector('input[name="bformule"]:checked')?.value;
    const bateau = document.getElementById('bf-bateau')?.value;
    const date = document.getElementById('bf-date')?.value;

    const prix = { 'aperitif': 35, 'soiree': 65, 'journee': 95 };
    const labels = { 'aperitif': 'Apéritif 2h', 'soiree': 'Soirée BBQ 3h30', 'journee': 'Journée 6h' };

    const el = (id) => document.getElementById(id);
    if (el('bsum-bateau')) el('bsum-bateau').textContent = bateau || '—';
    if (el('bsum-formule')) el('bsum-formule').textContent = formule ? labels[formule] : '—';
    if (el('bsum-date')) el('bsum-date').textContent = date ? formatDateFR(date) : '—';
    if (el('bsum-nb')) el('bsum-nb').textContent = `${nb} personnes`;

    if (formule) {
      const total = prix[formule] * nb;
      if (el('bsum-total')) el('bsum-total').textContent = `${total}€`;
      if (el('bsum-unitaire')) el('bsum-unitaire').textContent = `${nb} × ${prix[formule]}€`;
    }
  }

  ['bf-bateau','bf-nb','bf-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateBoatSummary);
  });
  document.querySelectorAll('input[name="bformule"]').forEach(r => r.addEventListener('change', updateBoatSummary));
});
