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

  // ── Calcul prix options ───────────────────────────────────────
  function calcOptionsPrice(formule, duree, nbAccomp, has4canne) {
    const tarifs = window.TARIFS_NUITS || { 1:35,2:70,3:90,4:110,5:130,6:150,7:170 };
    const accomp = window.TARIF_ACCOMPAGNANT || { demi:5, jour:10, nuit:10 };

    let accompPrice = 0;
    let canne4Price = 0;

    if (formule === 'demi') {
      accompPrice = accomp.demi * nbAccomp;
      canne4Price = 0; // non disponible demi-journée
    } else if (formule === 'jour') {
      accompPrice = accomp.jour * nbAccomp;
      canne4Price = has4canne ? 10 : 0;
    } else if (formule === 'nuit') {
      accompPrice = accomp.nuit * duree * nbAccomp;
      // 4ème canne nuit: max(20, duree×10)
      canne4Price = has4canne ? Math.max(20, duree * 10) : 0;
    }
    return { accompPrice, canne4Price, total: accompPrice + canne4Price };
  }

  // ── Mise à jour du récapitulatif ──────────────────────────────
  function updateSummary() {
    const posteId  = parseInt(document.getElementById('f-poste')?.value);
    const formule  = document.querySelector('input[name="formule"]:checked')?.value;
    const duree    = parseInt(document.getElementById('f-duree')?.value || 1);
    const nb       = parseInt(document.getElementById('f-nb')?.value || 1);
    const date     = document.getElementById('f-date-debut')?.value;
    const nbAccomp = parseInt(document.getElementById('f-accompagnant')?.value || 0);
    const has4canne = document.getElementById('f-4canne')?.checked || false;

    const poste = typeof POSTES !== 'undefined' ? POSTES.find(p => p.id === posteId) : null;

    const el = id => document.getElementById(id);

    if (poste) {
      if (el('sum-poste')) el('sum-poste').textContent = `#${poste.id} ${poste.nom}`;
    } else {
      if (el('sum-poste')) el('sum-poste').textContent = '—';
    }

    // Labels formule
    const formuleLabels = { 'demi': 'Demi-journée', 'jour': 'Journée (12h)', 'nuit': 'Nuitée (24h)' };
    if (el('sum-formule')) el('sum-formule').textContent = formuleLabels[formule] || '—';
    if (el('sum-date'))    el('sum-date').textContent    = date ? formatDateFR(date) : '—';
    if (el('sum-duree'))   el('sum-duree').textContent   = formule === 'nuit'
      ? `${duree} nuit${duree > 1 ? 's' : ''}`
      : `${duree} session${duree > 1 ? 's' : ''}`;
    if (el('sum-nb'))      el('sum-nb').textContent      = `${nb} pêcheur${nb > 1 ? 's' : ''}`;

    // Affichage radio prices
    const priceDemiEl = el('price-demi');
    const priceJourEl = el('price-jour');
    const priceNuitEl = el('price-nuit');
    if (priceDemiEl) priceDemiEl.textContent = '15 €';
    if (priceJourEl) priceJourEl.textContent = '20 €';
    if (priceNuitEl) priceNuitEl.textContent = formule === 'nuit'
      ? `${(window.TARIFS_NUITS || {})[duree] || 35} €`
      : '35 €';

    // ── Options UI ────────────────────────────────────────────
    const accomp = window.TARIF_ACCOMPAGNANT || { demi:5, jour:10, nuit:10 };

    // Prix affiché dans la carte accompagnant
    const optAccompPrice = el('opt-accompagnant-price');
    if (optAccompPrice) {
      if (!formule) {
        optAccompPrice.textContent = '+5–10 € / pers.';
      } else if (formule === 'demi') {
        optAccompPrice.textContent = `+${accomp.demi} € / pers.`;
      } else if (formule === 'jour') {
        optAccompPrice.textContent = `+${accomp.jour} € / pers.`;
      } else {
        optAccompPrice.textContent = `+${accomp.nuit} € / pers. / nuit`;
      }
    }

    // 4ème canne — afficher/désactiver selon formule
    const opt4canneCard  = el('opt-4canne-card');
    const opt4cannePrice = el('opt-4canne-price');
    const f4canne        = el('f-4canne');
    if (opt4canneCard) {
      if (formule === 'demi' || !formule) {
        opt4canneCard.classList.add('disabled');
        if (f4canne) f4canne.checked = false;
        if (opt4cannePrice) opt4cannePrice.textContent = 'Non disponible';
      } else {
        opt4canneCard.classList.remove('disabled');
        if (formule === 'jour') {
          if (opt4cannePrice) opt4cannePrice.textContent = '+10 €';
        } else {
          const p = Math.max(20, duree * 10);
          if (opt4cannePrice) opt4cannePrice.textContent = `+${p} € (${duree} nuit${duree>1?'s':''})`;
        }
      }
    }

    // Visuel option-card has-value
    const accompCard = el('opt-accompagnant-card');
    if (accompCard) accompCard.classList.toggle('has-value', nbAccomp > 0);
    if (opt4canneCard) opt4canneCard.classList.toggle('has-value', has4canne && formule !== 'demi');

    // ── Total ────────────────────────────────────────────────
    if (poste && formule) {
      const tarifs  = window.TARIFS_NUITS || { 1:35,2:70,3:90,4:110,5:130,6:150,7:170 };
      let basePrice = formule === 'nuit'
        ? (tarifs[duree] || duree * 35)
        : (formule === 'demi' ? 15 : 20) * duree;

      const opts        = calcOptionsPrice(formule, duree, nbAccomp, has4canne);
      const materielPrice = typeof calcMaterielPrice === 'function' ? calcMaterielPrice() : 0;

      const total = basePrice + opts.accompPrice + opts.canne4Price + materielPrice;
      if (el('sum-total')) el('sum-total').textContent = `${total} €`;

      // Lignes options dans récap
      const accompLine  = el('sum-accompagnant-line');
      const canne4Line  = el('sum-4canne-line');
      const materielLine = el('sum-materiel-line');
      if (accompLine) {
        accompLine.style.display = nbAccomp > 0 ? 'flex' : 'none';
        if (el('sum-accompagnant')) el('sum-accompagnant').textContent =
          `${nbAccomp} × ${opts.accompPrice / (nbAccomp || 1)} € = +${opts.accompPrice} €`;
      }
      if (canne4Line) {
        canne4Line.style.display = (has4canne && formule !== 'demi') ? 'flex' : 'none';
        if (el('sum-4canne')) el('sum-4canne').textContent = `+${opts.canne4Price} €`;
      }
      if (materielLine) {
        materielLine.style.display = materielPrice > 0 ? 'flex' : 'none';
        if (el('sum-materiel')) el('sum-materiel').textContent = `+${materielPrice} €`;
      }
    } else {
      if (el('sum-total')) el('sum-total').textContent = '—';
    }
  }

  // ── Stepper accompagnant ─────────────────────────────────────
  const accompMinus = document.getElementById('accomp-minus');
  const accompPlus  = document.getElementById('accomp-plus');
  const accompVal   = document.getElementById('accomp-val');
  const accompSel   = document.getElementById('f-accompagnant');
  if (accompMinus && accompPlus && accompVal && accompSel) {
    accompMinus.addEventListener('click', () => {
      const cur = parseInt(accompSel.value) || 0;
      if (cur > 0) { accompSel.value = cur - 1; accompVal.textContent = cur - 1; updateSummary(); }
    });
    accompPlus.addEventListener('click', () => {
      const cur = parseInt(accompSel.value) || 0;
      if (cur < 4) { accompSel.value = cur + 1; accompVal.textContent = cur + 1; updateSummary(); }
    });
  }

  // ── Location de matériel toggle ───────────────────────────────
  const materielToggle = document.getElementById('materiel-toggle');
  const materielPanel  = document.getElementById('materiel-panel');
  if (materielToggle && materielPanel) {
    materielToggle.addEventListener('click', () => {
      const open = materielPanel.classList.toggle('open');
      materielToggle.classList.toggle('open', open);
    });
    materielToggle.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); materielToggle.click(); } });
  }

  document.querySelectorAll('.materiel-cb').forEach(cb => cb.addEventListener('change', () => { updateMaterielUI(); updateSummary(); }));

  function calcMaterielPrice() {
    const formule = document.querySelector('input[name="formule"]:checked')?.value || 'jour';
    const duree   = parseInt(document.getElementById('f-duree')?.value || 1);
    let total = 0;
    document.querySelectorAll('.materiel-cb:checked').forEach(cb => {
      const pJour = parseInt(cb.dataset.jour) || 0;
      const pNuit = parseInt(cb.dataset.nuit) || 0;
      if (formule === 'nuit') total += pNuit * duree;
      else total += pJour;
    });
    return total;
  }

  function updateMaterielUI() {
    const formule = document.querySelector('input[name="formule"]:checked')?.value || 'jour';
    const duree   = parseInt(document.getElementById('f-duree')?.value || 1);
    const checked = document.querySelectorAll('.materiel-cb:checked').length;
    const price   = calcMaterielPrice();

    // Update badge on section label
    const badge = document.getElementById('materiel-total-badge');
    if (badge) {
      if (checked > 0) {
        badge.textContent = `${checked} article${checked > 1 ? 's' : ''} · +${price} €`;
        badge.style.display = 'inline';
      } else {
        badge.style.display = 'none';
      }
    }

    // Update individual card price labels
    document.querySelectorAll('.materiel-cb').forEach(cb => {
      const id     = cb.dataset.id;
      const pJour  = parseInt(cb.dataset.jour) || 0;
      const pNuit  = parseInt(cb.dataset.nuit) || 0;
      const priceEl = document.getElementById(`mprice-${id}`);
      if (!priceEl) return;
      if (formule === 'nuit' && pNuit) {
        priceEl.textContent = duree > 1 ? `${pNuit * duree} € (${duree}n)` : `${pNuit} €/n`;
      } else {
        const isDay = formule === 'jour';
        priceEl.textContent = `${pJour} €${isDay ? '/j' : ''}`;
      }
    });
  }

  ['f-poste','f-duree','f-nb','f-date-debut'].forEach(id => {
    const e = document.getElementById(id);
    if (e) e.addEventListener('change', () => { updateMaterielUI(); updateSummary(); });
  });
  document.querySelectorAll('input[name="formule"]').forEach(r => r.addEventListener('change', () => { updateMaterielUI(); updateSummary(); }));
  const f4c = document.getElementById('f-4canne');
  if (f4c) f4c.addEventListener('change', updateSummary);

  // Date minimum = aujourd'hui
  const dateInput = document.getElementById('f-date-debut');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min   = today;
    dateInput.value = today;
    updateSummary();
  }

  // ── Calendrier — données réservées (Firebase temps réel) ──────
  let _bookedDates = [];
  let _calUnsubscribe = null;

  function setupCalendarWatch(posteId) {
    if (_calUnsubscribe) { _calUnsubscribe(); _calUnsubscribe = null; }
    _bookedDates = [];
    renderCalendar();
    if (!posteId || typeof LacDB === 'undefined') return;
    _calUnsubscribe = LacDB.watchPosteBookedDates(posteId, dates => {
      _bookedDates = dates;
      renderCalendar();
    });
  }

  // ── Soumission du formulaire de pêche ─────────────────────────
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const prenom    = document.getElementById('f-prenom').value.trim();
      const nom       = document.getElementById('f-nom').value.trim();
      const email     = document.getElementById('f-email').value.trim();
      const tel       = document.getElementById('f-tel').value.trim();
      const posteId   = parseInt(document.getElementById('f-poste').value);
      const formule   = document.querySelector('input[name="formule"]:checked')?.value;
      const dateDebut = document.getElementById('f-date-debut').value;
      const duree     = parseInt(document.getElementById('f-duree').value);
      const nb        = parseInt(document.getElementById('f-nb').value);
      const nbAccomp  = parseInt(document.getElementById('f-accompagnant')?.value || 0);
      const has4canne = document.getElementById('f-4canne')?.checked || false;
      const technique = document.getElementById('f-technique')?.value || '';
      const message   = document.getElementById('f-message')?.value;

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

      // Calcul du total
      const tarifs = window.TARIFS_NUITS || { 1:35,2:70,3:90,4:110,5:130,6:150,7:170 };
      const basePrice = formule === 'nuit'
        ? (tarifs[duree] || duree * 35)
        : (formule === 'demi' ? 15 : 20) * duree;
      const opts  = calcOptionsPrice(formule, duree, nbAccomp, has4canne);
      const materielPrice = typeof calcMaterielPrice === 'function' ? calcMaterielPrice() : 0;
      const total = basePrice + opts.accompPrice + opts.canne4Price + materielPrice;
      const selectedMateriel = Array.from(document.querySelectorAll('.materiel-cb:checked')).map(cb => cb.dataset.id);

      const booking = {
        type: 'peche', status: 'pending',
        posteId, prenom, nom, email, tel, formule, dateDebut, duree, nb, message, dates,
        nbAccompagnants: nbAccomp,
        canne4: has4canne && formule !== 'demi',
        technique,
        materiel: selectedMateriel,
        totalPrice: total,
      };

      const submitBtn = bookingForm.querySelector('[type="submit"]');
      const origHtml  = submitBtn?.innerHTML;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<span>Envoi en cours…</span>'; }

      try {
        if (typeof LacDB !== 'undefined') await LacDB.addReservation(booking);

        const formuleLabels = { 'demi': 'Demi-journée', 'jour': 'Journée (12h)', 'nuit': 'Nuitée (24h)' };
        let msg = `✓ Réservation enregistrée ! Poste #${posteId} — ${poste.nom} — ${total} €.`;
        if (nbAccomp > 0) msg += ` (${nbAccomp} accompagnant${nbAccomp>1?'s':''})`;
        msg += ` Nous vous contacterons à ${email}.`;
        showToast(msg, 'success', '🎣');

        bookingForm.reset();
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        updateSummary();

      } catch (err) {
        console.error('[Réservation pêche]', err);
        showToast('Erreur de connexion. Veuillez réessayer ou nous appeler.', 'error', '⚠️');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origHtml; }
      }
    });
  }

  // ── Calendrier ────────────────────────────────────────────────
  let calendarDate = new Date();
  const JOURS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const MOIS  = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  function renderCalendar() {
    const grid  = document.getElementById('cal-grid');
    const label = document.getElementById('cal-month-label');
    if (!grid || !label) return;

    label.textContent = `${MOIS[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`;
    grid.innerHTML = '';

    JOURS.forEach(j => {
      const d = document.createElement('div');
      d.className = 'calendar-day-name';
      d.textContent = j;
      grid.appendChild(d);
    });

    const year     = calendarDate.getFullYear();
    const month    = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);

    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const today        = new Date().toISOString().split('T')[0];
    const confirmedDates = Array.isArray(_bookedDates) ? _bookedDates : (_bookedDates.confirmed || []);
    const pendingDates   = Array.isArray(_bookedDates) ? [] : (_bookedDates.pending || []);
    const selectedDate = document.getElementById('f-date-debut')?.value;

    for (let i = 0; i < startDow; i++) {
      const blank = document.createElement('div');
      blank.className = 'calendar-day other-month';
      grid.appendChild(blank);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const cell    = document.createElement('div');
      cell.className  = 'calendar-day';
      cell.textContent = d;

      if (dateStr === today) cell.classList.add('today');
      if (confirmedDates.includes(dateStr)) {
        cell.classList.add('booked');
        cell.title = 'Déjà réservé';
      } else if (pendingDates.includes(dateStr)) {
        cell.classList.add('pending');
        cell.title = 'En attente de confirmation';
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

  const posteSelectEl = document.getElementById('f-poste');
  if (posteSelectEl) {
    posteSelectEl.addEventListener('change', () => {
      const id = parseInt(posteSelectEl.value);
      if (id) setupCalendarWatch(id); else renderCalendar();
    });
    const initialId = parseInt(posteSelectEl.value);
    if (initialId) setupCalendarWatch(initialId);
  }

  // ── Soumission formulaire bateau ──────────────────────────────
  const boatForm = document.getElementById('boat-booking-form');
  if (boatForm) {
    boatForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const prenom  = document.getElementById('bf-prenom')?.value.trim();
      const nom     = document.getElementById('bf-nom')?.value.trim();
      const email   = document.getElementById('bf-email')?.value.trim();
      const tel     = document.getElementById('bf-tel')?.value.trim();
      const bateau  = document.getElementById('bf-bateau')?.value;
      const formule = document.querySelector('input[name="bformule"]:checked')?.value;
      const date    = document.getElementById('bf-date')?.value;
      const nb      = document.getElementById('bf-nb')?.value;

      if (!prenom || !nom || !email || !tel || !bateau || !formule || !date) {
        showToast('Veuillez remplir tous les champs obligatoires.', 'error', '⚠️');
        return;
      }

      const BPRIX = { 'petit-dej':70, 'midi':210, 'apres-midi':110, 'soiree':210, 'demi-matin':270, 'demi-soir':270 };
      const BLABELS = { 'petit-dej':'Petit déj. 9h–10h30','midi':'Déjeuner 11h30–14h30','apres-midi':'Après-midi 15h30–17h30','soiree':'Soirée 18h–21h','demi-matin':'Demi-j. 10h–15h','demi-soir':'Demi-j. 16h–20h' };
      const basePrice = BPRIX[formule] || 0;
      const nbPers = parseInt(nb);
      const optCbs = document.querySelectorAll('.boat-opt-cb:checked');
      const optionsTotal = Array.from(optCbs).reduce((sum, cb) => sum + (parseInt(cb.dataset.price) || 0) * nbPers, 0);
      const total = basePrice + optionsTotal;
      const selectedOpts = Array.from(optCbs).map(cb => cb.id);

      const booking = { type:'bateau', status:'pending', prenom, nom, email, tel, bateau, formule, date, nb: nbPers, options: selectedOpts, optionsPrice: optionsTotal, totalPrice: total };

      const submitBtn = boatForm.querySelector('[type="submit"]');
      const origHtml  = submitBtn?.innerHTML;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<span>Envoi en cours…</span>'; }

      try {
        if (typeof LacDB !== 'undefined') await LacDB.addReservation(booking);

        showToast(`🔥 Réservation bateau enregistrée ! ${BLABELS[formule]} — ${total} € (${nbPers} pers.). Nous vous contacterons à ${email}.`, 'success', '🔥');
        boatForm.reset();
        const bdate = document.getElementById('bf-date');
        if (bdate) bdate.min = new Date().toISOString().split('T')[0];

      } catch (err) {
        console.error('[Réservation bateau]', err);
        showToast('Erreur de connexion. Veuillez réessayer ou nous appeler.', 'error', '⚠️');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origHtml; }
      }
    });

    const bdateInput = document.getElementById('bf-date');
    if (bdateInput) bdateInput.min = new Date().toISOString().split('T')[0];
  }

  // Mise à jour récapitulatif bateau
  function updateBoatSummary() {
    const nb      = parseInt(document.getElementById('bf-nb')?.value || 2);
    const formule = document.querySelector('input[name="bformule"]:checked')?.value;
    const bateau  = document.getElementById('bf-bateau')?.value;
    const date    = document.getElementById('bf-date')?.value;

    const BPRIX   = { 'petit-dej':70, 'midi':210, 'apres-midi':110, 'soiree':210, 'demi-matin':270, 'demi-soir':270 };
    const BLABELS = { 'petit-dej':'Petit déj. 9h–10h30','midi':'Déjeuner 11h30–14h30','apres-midi':'Après-midi 15h30–17h30','soiree':'Soirée 18h–21h','demi-matin':'Demi-j. 10h–15h','demi-soir':'Demi-j. 16h–20h' };

    const el = id => document.getElementById(id);
    if (el('bsum-bateau'))  el('bsum-bateau').textContent  = bateau || '—';
    if (el('bsum-formule')) el('bsum-formule').textContent = formule ? BLABELS[formule] : '—';
    if (el('bsum-date'))    el('bsum-date').textContent    = date ? formatDateFR(date) : '—';
    if (el('bsum-nb'))      el('bsum-nb').textContent      = `${nb} personnes`;

    if (formule) {
      const basePrice = BPRIX[formule] || 0;
      const optCbs = document.querySelectorAll('.boat-opt-cb:checked');
      const optionsTotal = Array.from(optCbs).reduce((sum, cb) => sum + (parseInt(cb.dataset.price) || 0) * nb, 0);
      const total = basePrice + optionsTotal;
      if (el('bsum-total'))    el('bsum-total').textContent    = `${total} €`;
      if (el('bsum-unitaire')) el('bsum-unitaire').textContent = `${basePrice} € / bateau`;
      const optsLine = el('bsum-opts-line');
      if (optsLine) optsLine.style.display = optionsTotal > 0 ? '' : 'none';
      if (el('bsum-opts')) el('bsum-opts').textContent = optionsTotal > 0 ? `+${optionsTotal} €` : '—';
    }
  }

  ['bf-bateau','bf-nb','bf-date'].forEach(id => {
    const e = document.getElementById(id);
    if (e) e.addEventListener('change', updateBoatSummary);
  });
  document.querySelectorAll('input[name="bformule"]').forEach(r => r.addEventListener('change', updateBoatSummary));
  document.querySelectorAll('.boat-opt-cb').forEach(cb => cb.addEventListener('change', updateBoatSummary));
});
