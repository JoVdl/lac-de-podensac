// ================================================================
// Système de réservation — pêche, location, bateau, emplacement
// ================================================================

const ACTIVITY_SECTIONS = {
  'carnassier-bord':     { peche:true, poste:true, zones:[{id:'zone-carnassier', label:'Zone carnassier'}], formule:true, calendar:true, nbPecheurs:true, optionsPeche:true, materiel:true },
  'carnassier-barque':   { peche:true, poste:true, zones:[{id:'zone-carnassier', label:'Zone carnassier'}], formule:true, calendar:true, nbPecheurs:true, optionsPeche:true, materiel:true },
  'carpe-batterie':      { peche:true, poste:true, posteFilter:[1,2,3,4,5,6], formule:true, calendar:true, nbPecheurs:true, optionsPeche:true, materiel:true, barqueOption:true },
  'coup':                { peche:true, poste:true, formule:true, calendar:true, nbPecheurs:true, optionsPeche:true, materiel:true },
  'feeder':              { peche:true, poste:true, formule:true, calendar:true, nbPecheurs:true, optionsPeche:true, materiel:true },
  'carnassier-pose':     { peche:true, poste:true, formule:true, calendar:true, nbPecheurs:true, optionsPeche:true, materiel:true },
  'canoe':               { location:true, formule:true, formuleFilter:['demi','jour'], calendar:true, materiel:true },
  'barque-sans-peche':   { location:true, formule:true, formuleFilter:['demi','jour'], barquePrix:true, calendar:true, materiel:true },
  'barbecue-boat':       { bateau:true, materiel:true },
  'emplacement-bbq':     { emplacementBBQ:true },
  'emplacement-camping': { emplacement:true, materiel:true },
};

const ACTIVITY_LABELS = {
  'carnassier-bord':     'Pêche au carnassier du bord',
  'carnassier-barque':   'Pêche au carnassier en barque équipée',
  'carpe-batterie':      'Pêche à la carpe en batterie',
  'coup':                'Pêche au coup',
  'feeder':              'Pêche au feeder',
  'carnassier-pose':     'Pêche du carnassier au posé',
  'canoe':               'Location de canoé',
  'barque-sans-peche':   'Location de barque sans pêche',
  'barbecue-boat':       'Location de barbecue-boat',
  'emplacement-bbq':     'Location emplacement barbecue',
  'emplacement-camping': 'Location tente / Van / Camping-car',
};

const BPRIX   = { 'petit-dej':70,'midi':210,'apres-midi':110,'soiree':210,'demi-matin':270,'demi-soir':270 };
const BLABELS = { 'petit-dej':'Petit déj. 9h–10h30','midi':'Déjeuner 11h30–14h30','apres-midi':'Après-midi 15h30–17h30','soiree':'Soirée 18h–21h','demi-matin':'Demi-j. matin 10h–15h','demi-soir':'Demi-j. soir 16h–20h' };

function parseFormule(formule) {
  if (!formule) return { type: null, duree: 1 };
  if (formule === 'demi') return { type: 'demi', duree: 1 };
  if (formule === 'jour') return { type: 'jour', duree: 1 };
  if (formule.startsWith('nuit-')) return { type: 'nuit', duree: parseInt(formule.split('-')[1]) || 1 };
  return { type: formule, duree: 1 };
}

document.addEventListener('DOMContentLoaded', function () {

  const el = id => document.getElementById(id);

  // ── Peuplement du select des postes ──────────────────────────
  function updatePosteOptions(filter, zones) {
    const posteSelect = el('f-poste');
    if (!posteSelect) return;
    while (posteSelect.options.length > 1) posteSelect.remove(1);

    if (zones) {
      // Zone mode (ex: Zone carnassier)
      zones.forEach(z => {
        const opt = document.createElement('option');
        opt.value = z.id;
        opt.textContent = z.label;
        posteSelect.appendChild(opt);
      });
      if (zones.length === 1) posteSelect.value = zones[0].id;
      return;
    }

    if (typeof POSTES === 'undefined') return;
    const filtered = filter ? POSTES.filter(p => filter.includes(p.id)) : POSTES;
    filtered.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      const statusLabel = p.disponible
        ? '✓ Disponible'
        : p.complet_jusqu_au
          ? `📅 Dispo à partir du ${p.complet_jusqu_au}`
          : '● Sur demande';
      opt.textContent = `#${p.id} — ${p.nom} (${statusLabel})`;
      posteSelect.appendChild(opt);
    });
    posteSelect.value = '';
  }
  updatePosteOptions(null);

  // ── Gestion du type d'activité ────────────────────────────────
  function onActivityChange(type) {
    const cfg = ACTIVITY_SECTIONS[type] || {};

    el('sec-poste').hidden         = !cfg.poste;
    el('sec-formule').hidden       = !cfg.formule;
    // Filtrer les tuiles de formule si nécessaire (ex : canoé = demi + jour seulement)
    const formuleGroup = el('f-formule-group');
    if (formuleGroup) {
      const filter = cfg.formuleFilter || null;
      formuleGroup.style.gridTemplateColumns = filter ? `repeat(${filter.length}, 1fr)` : 'repeat(3, 1fr)';
      formuleGroup.querySelectorAll('label.form-radio').forEach(lbl => {
        const val = lbl.querySelector('input')?.value;
        lbl.style.display = (!filter || filter.includes(val)) ? '' : 'none';
        if (filter && !filter.includes(val)) { const inp = lbl.querySelector('input'); if (inp) inp.checked = false; }
      });
    }
    // Mettre à jour les prix des tuiles demi/jour selon l'activité
    if (formuleGroup) {
      const demiPrice = formuleGroup.querySelector('input[value="demi"]')?.closest('label')?.querySelector('.form-radio__price');
      const jourPrice = formuleGroup.querySelector('input[value="jour"]')?.closest('label')?.querySelector('.form-radio__price');
      if (demiPrice) demiPrice.textContent = cfg.barquePrix ? '20 €' : '15 €';
      if (jourPrice) jourPrice.textContent = cfg.barquePrix ? '30 €' : '20 €';
    }
    el('sec-calendar').hidden      = !cfg.calendar;
    const secDuree = el('sec-duree'); if (secDuree) secDuree.hidden = true;
    el('sec-nb-pecheurs').hidden   = !cfg.nbPecheurs;
    el('sec-bateau').hidden        = !cfg.bateau;
    el('sec-emplacement').hidden   = !cfg.emplacement;
    const secEmplBBQ = el('sec-emplacement-bbq'); if (secEmplBBQ) secEmplBBQ.hidden = !cfg.emplacementBBQ;
    el('sec-options-peche').hidden = !cfg.optionsPeche;
    el('sec-materiel').hidden      = !cfg.materiel;
    const barqueCard = el('mcard-barque-location');
    if (barqueCard) {
      barqueCard.style.display = cfg.barqueOption ? 'flex' : 'none';
      if (!cfg.barqueOption) { const cb = barqueCard.querySelector('.materiel-cb'); if (cb) cb.checked = false; }
    }

    if (cfg.poste) {
      updatePosteOptions(cfg.posteFilter || null, cfg.zones || null);
      const lbl = el('sec-poste-label');
      if (lbl) lbl.textContent = cfg.zones ? 'Zone de pêche *' : 'Poste de pêche *';
    }

    if (cfg.calendar) {
      const posteId = cfg.poste ? (parseInt(el('f-poste')?.value) || null) : null;
      setupCalendarWatch(posteId);
    } else {
      if (_calUnsubscribe) { _calUnsubscribe(); _calUnsubscribe = null; }
    }

    if (el('sum-activite'))    el('sum-activite').textContent    = ACTIVITY_LABELS[type] || type;
    if (el('sum-poste-line'))  el('sum-poste-line').style.display  = cfg.poste ? '' : 'none';
    if (el('sum-formule-line'))el('sum-formule-line').style.display = cfg.formule ? '' : 'none';
    if (el('sum-creneau-line'))el('sum-creneau-line').style.display = cfg.bateau ? '' : 'none';
    if (el('sum-duree-line'))  el('sum-duree-line').style.display   = (cfg.formule || cfg.emplacement) ? '' : 'none';
    if (el('sum-nb-line'))     el('sum-nb-line').style.display      = cfg.nbPecheurs ? '' : 'none';
    if (el('sum-nbpers-line')) el('sum-nbpers-line').style.display  = cfg.bateau ? '' : 'none';

    updateMaterielUI();
    updateSummary();
  }

  // ── Gestion de la catégorie (premier niveau) ─────────────────
  const CAT_ACTIVITIES = {
    peche:       ['carnassier-bord','carnassier-barque','carpe-batterie','coup','feeder','carnassier-pose'],
    bateau:      ['barbecue-boat'],
    hebergement: ['emplacement-bbq','emplacement-camping'],
    nautique:    ['canoe','barque-sans-peche'],
  };

  function onCategoryChange(cat) {
    const secActivity = el('sec-activity');
    if (!secActivity) return;

    // Reset activité sélectionnée et sections
    document.querySelectorAll('input[name="activity"]').forEach(r => r.checked = false);
    ['sec-poste','sec-formule','sec-calendar','sec-nb-pecheurs','sec-bateau','sec-emplacement','sec-emplacement-bbq','sec-options-peche','sec-materiel'].forEach(id => {
      const s = el(id); if (s) s.hidden = true;
    });
    if (el('sum-activite')) el('sum-activite').textContent = '—';
    if (el('sum-total'))    el('sum-total').textContent    = '—';

    // Afficher les groupes correspondant à la catégorie
    document.querySelectorAll('.act-group').forEach(g => {
      g.style.display = g.dataset.cat === cat ? 'contents' : 'none';
    });

    secActivity.hidden = false;

    // Auto-sélection si une seule activité dans la catégorie
    const acts = CAT_ACTIVITIES[cat] || [];
    if (acts.length === 1) {
      const radio = document.querySelector(`input[name="activity"][value="${acts[0]}"]`);
      if (radio) { radio.checked = true; onActivityChange(acts[0]); }
    }
  }

  document.querySelectorAll('input[name="category"]').forEach(r => {
    r.addEventListener('change', e => onCategoryChange(e.target.value));
  });

  document.querySelectorAll('input[name="activity"]').forEach(r => {
    r.addEventListener('change', e => onActivityChange(e.target.value));
  });

  // ── Calcul prix options pêche ─────────────────────────────────
  function calcOptionsPrice(fType, duree, nbAccomp, has4canne) {
    const accomp = window.TARIF_ACCOMPAGNANT || { demi:5, jour:10, nuit:10 };
    let accompPrice = 0, canne4Price = 0;
    if (fType === 'demi') {
      accompPrice = accomp.demi * nbAccomp;
    } else if (fType === 'jour') {
      accompPrice = accomp.jour * nbAccomp;
      canne4Price = has4canne ? 10 : 0;
    } else if (fType === 'nuit') {
      accompPrice = accomp.nuit * duree * nbAccomp;
      canne4Price = has4canne ? 10 * duree : 0;
    }
    return { accompPrice, canne4Price, total: accompPrice + canne4Price };
  }

  // ── Mise à jour du récapitulatif ──────────────────────────────
  function updateSummary() {
    const activity = document.querySelector('input[name="activity"]:checked')?.value;
    const cfg = ACTIVITY_SECTIONS[activity] || {};

    if (el('sum-activite')) el('sum-activite').textContent = ACTIVITY_LABELS[activity] || '—';

    // ── Barbecue-boat ──
    if (cfg.bateau) {
      const formule = document.querySelector('input[name="bformule"]:checked')?.value;
      const nb      = parseInt(el('f-bateau-nb')?.value || 2);
      const date    = el('f-bateau-date')?.value;

      if (el('sum-creneau')) el('sum-creneau').textContent = formule ? (BLABELS[formule] || formule) : '—';
      if (el('sum-date'))    el('sum-date').textContent    = date ? formatDateFR(date) : '—';
      if (el('sum-nbpers'))  el('sum-nbpers').textContent  = `${nb} personne${nb > 1 ? 's' : ''}`;
      if (el('sum-par-pers-line')) el('sum-par-pers-line').style.display = 'none';

      if (formule) {
        const basePrice     = BPRIX[formule] || 0;
        const optCbs        = document.querySelectorAll('.boat-opt-cb:checked');
        const optionsTotal  = Array.from(optCbs).reduce((sum, cb) => { const p = parseInt(cb.dataset.price)||0; return sum + (cb.dataset.flat==='true'?p:p*nb); }, 0);
        const materielPrice = calcMaterielPrice();
        const total = basePrice + optionsTotal + materielPrice;
        if (el('sum-total')) el('sum-total').textContent = `${total} €`;
        const optsBoatLine = el('sum-opts-boat-line');
        if (optsBoatLine) optsBoatLine.style.display = optionsTotal > 0 ? '' : 'none';
        if (el('sum-opts-boat')) el('sum-opts-boat').textContent = optionsTotal > 0 ? `+${optionsTotal} €` : '—';
        const matLine = el('sum-materiel-line');
        if (matLine) matLine.style.display = materielPrice > 0 ? '' : 'none';
        if (el('sum-materiel')) el('sum-materiel').textContent = materielPrice > 0 ? `+${materielPrice} €` : '—';
      } else {
        if (el('sum-total')) el('sum-total').textContent = '—';
      }
      return;
    }

    // ── Emplacement BBQ ──
    if (cfg.emplacementBBQ) {
      const date   = el('f-bbq-date')?.value;
      const creneau = el('f-bbq-creneau')?.value || '';
      const nb     = parseInt(el('f-bbq-nb')?.value || 1);
      const basePrice = 5 * nb;

      const optCbs = document.querySelectorAll('.bbq-opt-cb:checked');
      const optsPrice = Array.from(optCbs).reduce((s, cb) => s + (parseInt(cb.dataset.price) || 0), 0);
      const total = basePrice + optsPrice;

      if (el('sum-date'))  el('sum-date').textContent  = date ? formatDateFR(date) : '—';
      if (el('sum-duree')) el('sum-duree').textContent = creneau || '—';
      if (el('sum-total')) el('sum-total').textContent = `${total} €`;
      const matLine = el('sum-materiel-line');
      if (matLine) matLine.style.display = optsPrice > 0 ? '' : 'none';
      if (el('sum-materiel')) el('sum-materiel').textContent = optsPrice > 0 ? `+${optsPrice} €` : '—';
      if (el('sum-par-pers-line')) el('sum-par-pers-line').style.display = '';
      if (el('sum-par-pers')) el('sum-par-pers').textContent = '5 €/pers.';
      return;
    }

    // ── Emplacement ──
    if (cfg.emplacement) {
      const date  = el('f-empl-date')?.value;
      const duree = parseInt(el('f-empl-duree')?.value || 1);
      const materielPrice = calcMaterielPrice();

      if (el('sum-date'))  el('sum-date').textContent  = date ? formatDateFR(date) : '—';
      if (el('sum-duree')) el('sum-duree').textContent = `${duree} nuit${duree > 1 ? 's' : ''}`;
      if (el('sum-total')) el('sum-total').textContent = materielPrice > 0 ? `${materielPrice} €` : 'Sur devis';

      const matLine = el('sum-materiel-line');
      if (matLine) matLine.style.display = materielPrice > 0 ? '' : 'none';
      if (el('sum-materiel')) el('sum-materiel').textContent = materielPrice > 0 ? `+${materielPrice} €` : '—';
      if (el('sum-par-pers-line')) el('sum-par-pers-line').style.display = 'none';
      return;
    }

    // ── Pêche + location nautique ──
    const rawFormule   = document.querySelector('input[name="formule"]:checked')?.value;
    const { type: fType, duree } = parseFormule(rawFormule);
    const posteRaw  = cfg.poste ? (el('f-poste')?.value || '') : '';
    const posteId   = parseInt(posteRaw) || null;
    const zoneLabel = (cfg.poste && !posteId) ? (el('f-poste')?.options[el('f-poste').selectedIndex]?.text || '') : null;
    const nb       = parseInt(el('f-nb')?.value || 1);
    const date     = el('f-date-debut')?.value;
    const nbAccomp = cfg.optionsPeche ? parseInt(el('f-accompagnant')?.value || 0) : 0;
    const has4canne = cfg.optionsPeche ? (el('f-4canne')?.checked || false) : false;
    const poste    = (posteId && typeof POSTES !== 'undefined') ? POSTES.find(p => p.id === posteId) : null;

    if (el('sum-poste')) el('sum-poste').textContent = poste ? `#${poste.id} ${poste.nom}` : (zoneLabel || '—');
    const tarifs = window.TARIFS_NUITS || { 1:35,2:70,3:90,4:110,5:130,6:150,7:170 };
    const formuleLabel = rawFormule ? (
      fType === 'demi' ? 'Demi-journée' :
      fType === 'jour' ? 'Journée (12h)' :
      fType === 'nuit' ? `${duree} nuit${duree > 1 ? 's' : ''}` : rawFormule
    ) : '—';
    const unitPrice = cfg.barquePrix
      ? (fType === 'demi' ? 20 : 30)
      : fType === 'nuit' ? (tarifs[duree] || duree * 35) : (fType === 'demi' ? 15 : 20);
    const formuleWithPrice = rawFormule && cfg.peche && nb > 1
      ? `${formuleLabel} · ${unitPrice} € × ${nb} pêcheurs`
      : formuleLabel;
    if (el('sum-formule')) el('sum-formule').textContent = formuleWithPrice;
    if (el('sum-date'))    el('sum-date').textContent    = date ? formatDateFR(date) : '—';
    if (el('sum-duree'))   el('sum-duree').textContent   = formuleLabel !== '—' ? formuleLabel : '—';
    if (el('sum-nb'))      el('sum-nb').textContent      = cfg.location && !cfg.peche ? '2 adultes + 1 enfant' : `${nb} pêcheur${nb > 1 ? 's' : ''}`;

    // Options accompagnant / 4ème canne
    if (cfg.optionsPeche) {
      const accomp = window.TARIF_ACCOMPAGNANT || { demi:5, jour:10, nuit:10 };
      const optAccompPrice = el('opt-accompagnant-price');
      if (optAccompPrice) {
        if (!rawFormule)         optAccompPrice.textContent = '+5–10 € / pers.';
        else if (fType==='demi') optAccompPrice.textContent = `+${accomp.demi} € / pers.`;
        else if (fType==='jour') optAccompPrice.textContent = `+${accomp.jour} € / pers.`;
        else                     optAccompPrice.textContent = `+${accomp.nuit} € / pers. / nuit`;
      }
      const opt4canneCard  = el('opt-4canne-card');
      const opt4cannePrice = el('opt-4canne-price');
      const f4canne        = el('f-4canne');
      if (opt4canneCard) {
        if (fType === 'demi' || !rawFormule) {
          opt4canneCard.classList.add('disabled');
          if (f4canne) f4canne.checked = false;
          if (opt4cannePrice) opt4cannePrice.textContent = 'Non disponible';
        } else {
          opt4canneCard.classList.remove('disabled');
          if (opt4cannePrice) opt4cannePrice.textContent = fType === 'jour'
            ? '+10 €'
            : `+${10 * duree} € (${duree} × 10 €/nuit)`;
        }
      }
      const accompCard = el('opt-accompagnant-card');
      if (accompCard) accompCard.classList.toggle('has-value', nbAccomp > 0);
      if (opt4canneCard) opt4canneCard.classList.toggle('has-value', has4canne && fType !== 'demi');
    }

    // Total
    const hasPoste = cfg.poste ? !!(poste || zoneLabel) : true;
    if (hasPoste && rawFormule) {
      let basePrice   = cfg.location && !cfg.peche ? unitPrice : unitPrice * nb;
      const opts = cfg.optionsPeche ? calcOptionsPrice(fType, duree, nbAccomp, has4canne) : { accompPrice:0, canne4Price:0 };
      const materielPrice = calcMaterielPrice();
      const total = basePrice + opts.accompPrice + opts.canne4Price + materielPrice;
      if (el('sum-total')) el('sum-total').textContent = `${total} €`;

      if (el('sum-par-pers-line')) el('sum-par-pers-line').style.display = cfg.location && !cfg.peche ? 'none' : '';
      if (el('sum-par-pers')) el('sum-par-pers').textContent = `${unitPrice} €/pêcheur`;

      const accompLine = el('sum-accompagnant-line');
      if (accompLine) {
        accompLine.style.display = nbAccomp > 0 ? 'flex' : 'none';
        if (el('sum-accompagnant')) el('sum-accompagnant').textContent =
          `${nbAccomp} × ${opts.accompPrice / (nbAccomp || 1)} € = +${opts.accompPrice} €`;
      }
      const canne4Line = el('sum-4canne-line');
      if (canne4Line) {
        canne4Line.style.display = (has4canne && formule !== 'demi') ? 'flex' : 'none';
        if (el('sum-4canne')) el('sum-4canne').textContent = `+${opts.canne4Price} €`;
      }
      const matLine = el('sum-materiel-line');
      if (matLine) {
        matLine.style.display = materielPrice > 0 ? 'flex' : 'none';
        if (el('sum-materiel')) el('sum-materiel').textContent = `+${materielPrice} €`;
      }
    } else {
      if (el('sum-total')) el('sum-total').textContent = '—';
      if (el('sum-par-pers-line')) el('sum-par-pers-line').style.display = 'none';
    }
  }

  // ── Stepper accompagnant ─────────────────────────────────────
  const accompMinus = el('accomp-minus');
  const accompPlus  = el('accomp-plus');
  const accompVal   = el('accomp-val');
  const accompSel   = el('f-accompagnant');
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
  const materielToggle = el('materiel-toggle');
  const materielPanel  = el('materiel-panel');
  if (materielToggle && materielPanel) {
    materielToggle.addEventListener('click', () => {
      const open = materielPanel.classList.toggle('open');
      materielToggle.classList.toggle('open', open);
    });
    materielToggle.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); materielToggle.click(); }
    });
  }

  document.querySelectorAll('.materiel-cb').forEach(cb => cb.addEventListener('change', () => { updateMaterielUI(); updateSummary(); }));

  document.querySelectorAll('.materiel-opt-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.option-toggle')) return;
      const cb = card.querySelector('.materiel-cb');
      if (cb) { cb.checked = !cb.checked; cb.dispatchEvent(new Event('change')); }
    });
  });

  function calcBarquePrice(duree) {
    if (duree <= 1) return 30;
    if (duree === 2) return 40;
    return 15 * duree;
  }

  function calcMaterielPrice() {
    const { duree } = parseFormule(document.querySelector('input[name="formule"]:checked')?.value);
    let total = 0;
    document.querySelectorAll('.materiel-cb:checked').forEach(cb => {
      if (cb.dataset.barque) total += calcBarquePrice(duree);
      else total += (parseInt(cb.dataset.jour) || 0) * duree;
    });
    return total;
  }

  function updateMaterielUI() {
    const { duree } = parseFormule(document.querySelector('input[name="formule"]:checked')?.value);
    const checked = document.querySelectorAll('.materiel-cb:checked').length;
    const price   = calcMaterielPrice();

    const badge = el('materiel-total-badge');
    if (badge) {
      if (checked > 0) {
        badge.textContent = `${checked} article${checked > 1 ? 's' : ''} · +${price} €`;
        badge.style.display = 'inline';
      } else {
        badge.style.display = 'none';
      }
    }

    document.querySelectorAll('.materiel-cb').forEach(cb => {
      const id      = cb.dataset.id;
      const priceEl = el(`mprice-${id}`);
      if (!priceEl) return;
      if (cb.dataset.barque) {
        const bp = calcBarquePrice(duree);
        const perJ = duree <= 1 ? 30 : duree === 2 ? 20 : 15;
        priceEl.textContent = duree > 1 ? `${bp} € (${duree}j × ${perJ} €/j)` : `${bp} €`;
      } else {
        const pJour = parseInt(cb.dataset.jour) || 0;
        priceEl.textContent = duree > 1 ? `${pJour * duree} € (${duree}j)` : `${pJour} €/j`;
      }
    });
  }

  // ── Sync bidirectionnel dates ↔ formule ──────────────────────
  function updateDepartureDate() {
    const dateDebut  = el('f-date-debut')?.value;
    const rawFormule = document.querySelector('input[name="formule"]:checked')?.value;
    const finInput   = el('f-date-fin');
    if (!finInput) return;
    if (!dateDebut || !rawFormule) { finInput.value = ''; return; }
    const { type: fType, duree } = parseFormule(rawFormule);
    if (fType === 'demi' || fType === 'jour') {
      finInput.value = dateDebut;
    } else if (fType === 'nuit') {
      finInput.value = new Date(new Date(dateDebut + 'T12:00:00').getTime() + duree * 86400000).toISOString().split('T')[0];
    } else {
      finInput.value = '';
    }
    renderCalendar();
  }

  function updateFormuleFromDates() {
    const debut = el('f-date-debut')?.value;
    const fin   = el('f-date-fin')?.value;
    if (!debut || !fin) return;
    const days = Math.round((new Date(fin + 'T12:00:00') - new Date(debut + 'T12:00:00')) / 86400000);
    // 0 days = demi ou jour (impossible de distinguer, on garde la sélection actuelle si déjà demi/jour)
    if (days === 0) {
      const current = document.querySelector('input[name="formule"]:checked')?.value;
      if (current !== 'demi' && current !== 'jour') {
        const radio = document.querySelector('input[name="formule"][value="jour"]');
        if (radio) { radio.checked = true; updateMaterielUI(); updateSummary(); }
      }
    } else if (days > 0) {
      const value = `nuit-${Math.min(days, 7)}`;
      const radio = document.querySelector(`input[name="formule"][value="${value}"]`);
      if (radio && !radio.checked) { radio.checked = true; updateMaterielUI(); updateSummary(); }
    }
    renderCalendar();
  }

  ['f-poste','f-nb','f-date-debut'].forEach(id => {
    const e = el(id);
    if (e) e.addEventListener('change', () => { updateMaterielUI(); updateSummary(); updateDepartureDate(); });
  });
  const finInput = el('f-date-fin');
  if (finInput) finInput.addEventListener('change', updateFormuleFromDates);
  document.querySelectorAll('input[name="formule"]').forEach(r => r.addEventListener('change', () => { updateMaterielUI(); updateSummary(); updateDepartureDate(); }));
  document.querySelectorAll('input[name="bformule"]').forEach(r => r.addEventListener('change', updateSummary));
  ['f-bateau-date','f-bateau-nb'].forEach(id => {
    const e = el(id);
    if (e) e.addEventListener('change', updateSummary);
  });
  document.querySelectorAll('.boat-opt-cb').forEach(cb => cb.addEventListener('change', updateSummary));
  ['f-empl-date','f-empl-duree','f-empl-nb'].forEach(id => {
    const e = el(id);
    if (e) e.addEventListener('change', updateSummary);
  });
  ['f-bbq-date','f-bbq-creneau','f-bbq-nb'].forEach(id => {
    const e = el(id);
    if (e) e.addEventListener('change', updateSummary);
  });
  document.querySelectorAll('.bbq-opt-cb').forEach(cb => cb.addEventListener('change', updateSummary));
  const f4c = el('f-4canne');
  if (f4c) f4c.addEventListener('change', updateSummary);

  // Date minimum = aujourd'hui
  const dateInput = el('f-date-debut');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min   = today;
    dateInput.value = today;
  }
  const bateauDateInput = el('f-bateau-date');
  if (bateauDateInput) bateauDateInput.min = new Date().toISOString().split('T')[0];
  const emplDateInput = el('f-empl-date');
  if (emplDateInput) emplDateInput.min = new Date().toISOString().split('T')[0];

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

  // ── Calendrier ────────────────────────────────────────────────
  let calendarDate = new Date();
  const JOURS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const MOIS  = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  function renderCalendar() {
    const grid  = el('cal-grid');
    const label = el('cal-month-label');
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

    const today          = new Date().toISOString().split('T')[0];
    const confirmedDates = Array.isArray(_bookedDates) ? _bookedDates : (_bookedDates.confirmed || []);
    const pendingDates   = Array.isArray(_bookedDates) ? [] : (_bookedDates.pending || []);
    const selectedDate = el('f-date-debut')?.value;
    const dateFin      = el('f-date-fin')?.value;

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
        cell.classList.add('booked'); cell.title = 'Déjà réservé';
      } else if (pendingDates.includes(dateStr)) {
        cell.classList.add('pending'); cell.title = 'En attente de confirmation';
      } else if (dateStr === selectedDate) {
        cell.classList.add('selected');
      } else if (selectedDate && dateFin && dateStr > selectedDate && dateStr < dateFin) {
        cell.classList.add('in-range');
      } else if (dateStr === dateFin && dateFin !== selectedDate) {
        cell.classList.add('selected', 'range-end');
      } else if (dateStr >= today) {
        cell.classList.add('available');
        cell.addEventListener('click', () => {
          const di = el('f-date-debut');
          if (di) { di.value = dateStr; di.dispatchEvent(new Event('change')); updateDepartureDate(); }
        });
      }
      grid.appendChild(cell);
    }
  }

  const calPrev = el('cal-prev');
  const calNext = el('cal-next');
  if (calPrev) calPrev.addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(); });
  if (calNext) calNext.addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(); });

  renderCalendar();

  const posteSelectEl = el('f-poste');
  if (posteSelectEl) {
    posteSelectEl.addEventListener('change', () => {
      const id = parseInt(posteSelectEl.value);
      if (id) setupCalendarWatch(id);
      else renderCalendar();
      updateSummary();
    });
  }

  // ── Soumission du formulaire unifié ──────────────────────────
  const bookingForm = el('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const activity = document.querySelector('input[name="activity"]:checked')?.value;
      if (!activity) {
        showToast('Veuillez sélectionner un type d\'activité.', 'error', '⚠️');
        return;
      }

      const prenom = el('f-prenom').value.trim();
      const nom    = el('f-nom').value.trim();
      const email  = el('f-email').value.trim();
      const tel    = el('f-tel').value.trim();

      if (!prenom || !nom || !email || !tel) {
        showToast('Veuillez remplir tous les champs de contact.', 'error', '⚠️');
        return;
      }

      const cfg     = ACTIVITY_SECTIONS[activity] || {};
      const message = el('f-message')?.value?.trim() || '';
      let booking = { status:'pending', prenom, nom, email, tel, activity, activityLabel: ACTIVITY_LABELS[activity], message };
      let total = 0;
      let toastMsg = '';

      if (cfg.bateau) {
        const date    = el('f-bateau-date')?.value;
        const formule = document.querySelector('input[name="bformule"]:checked')?.value;
        const nb      = parseInt(el('f-bateau-nb')?.value || 2);

        if (!date || !formule) {
          showToast('Veuillez choisir une date et un créneau.', 'error', '⚠️');
          return;
        }

        const optCbs       = document.querySelectorAll('.boat-opt-cb:checked');
        const optionsTotal = Array.from(optCbs).reduce((sum, cb) => { const p = parseInt(cb.dataset.price)||0; return sum + (cb.dataset.flat==='true'?p:p*nb); }, 0);
        const materielPrice = calcMaterielPrice();
        total = (BPRIX[formule] || 0) + optionsTotal + materielPrice;

        Object.assign(booking, {
          type:'bateau', date, formule, nb,
          options: Array.from(optCbs).map(cb => cb.id),
          optionsPrice: optionsTotal,
          materiel: Array.from(document.querySelectorAll('.materiel-cb:checked')).map(cb => cb.dataset.id),
          materielPrice,
          totalPrice: total,
        });
        toastMsg = `🔥 Réservation enregistrée ! ${BLABELS[formule]} — ${total} € (${nb} pers.). Confirmation à ${email}.`;

      } else if (cfg.emplacementBBQ) {
        const date    = el('f-bbq-date')?.value;
        const creneau = el('f-bbq-creneau')?.value || '';
        const nb      = parseInt(el('f-bbq-nb')?.value || 1);

        if (!date) {
          showToast('Veuillez choisir une date.', 'error', '⚠️');
          return;
        }
        if (!creneau) {
          showToast('Veuillez choisir un créneau (journée ou après-midi).', 'error', '⚠️');
          return;
        }

        const optCbs    = document.querySelectorAll('.bbq-opt-cb:checked');
        const optsPrice = Array.from(optCbs).reduce((s, cb) => s + (parseInt(cb.dataset.price) || 0), 0);
        const basePrice = 5 * nb;
        total = basePrice + optsPrice;

        Object.assign(booking, {
          type: 'emplacement-bbq', date, creneau, nb,
          options: Array.from(optCbs).map(cb => cb.dataset.label || cb.id),
          optionsPrice: optsPrice,
          totalPrice: total,
        });
        toastMsg = `🔥 Réservation enregistrée ! Emplacement BBQ — ${creneau}, ${nb} pers. — ${total} €. Confirmation à ${email}.`;

      } else if (cfg.emplacement) {
        const date  = el('f-empl-date')?.value;
        const duree = parseInt(el('f-empl-duree')?.value || 1);
        const nb    = parseInt(el('f-empl-nb')?.value || 1);

        if (!date) {
          showToast('Veuillez choisir une date d\'arrivée.', 'error', '⚠️');
          return;
        }

        const materielPrice = calcMaterielPrice();
        total = materielPrice;

        Object.assign(booking, {
          type:'emplacement', date, duree, nb,
          materiel: Array.from(document.querySelectorAll('.materiel-cb:checked')).map(cb => cb.dataset.id),
          materielPrice,
          totalPrice: total,
        });
        toastMsg = `⛺ Réservation enregistrée ! ${ACTIVITY_LABELS[activity]} — ${duree} nuit${duree>1?'s':''}, ${nb} pers. Confirmation à ${email}.`;

      } else {
        // Pêche + location nautique
        const rawFormule = document.querySelector('input[name="formule"]:checked')?.value;
        const { type: fType, duree } = parseFormule(rawFormule);
        const dateDebut = el('f-date-debut')?.value;

        if (!rawFormule || !dateDebut) {
          showToast('Veuillez choisir une formule et une date.', 'error', '⚠️');
          return;
        }

        if (cfg.poste && !el('f-poste')?.value) {
          showToast('Veuillez choisir un poste de pêche.', 'error', '⚠️');
          return;
        }

        const dates = [];
        const d = new Date(dateDebut + 'T12:00:00');
        for (let i = 0; i < duree; i++) {
          dates.push(new Date(d.getTime() + i * 86400000).toISOString().split('T')[0]);
        }

        const tarifs       = window.TARIFS_NUITS || {1:35,2:70,3:90,4:110,5:130,6:150,7:170};
        const unitPrice    = fType === 'nuit' ? (tarifs[duree] || duree * 35) : (fType === 'demi' ? 15 : 20);
        const formuleLabel = fType === 'demi' ? 'Demi-journée' : fType === 'jour' ? 'Journée' : `${duree} nuit${duree>1?'s':''}`;
        const materielPrice    = calcMaterielPrice();
        const selectedMateriel = Array.from(document.querySelectorAll('.materiel-cb:checked')).map(cb => cb.dataset.id);

        if (cfg.poste) {
          const posteRaw  = el('f-poste')?.value || '';
          const posteId   = parseInt(posteRaw) || null;
          const zoneLabel = posteId ? null : el('f-poste')?.options[el('f-poste').selectedIndex]?.text || posteRaw;
          const nb        = parseInt(el('f-nb')?.value || 1);
          const nbAccomp  = parseInt(el('f-accompagnant')?.value || 0);
          const has4canne = el('f-4canne')?.checked || false;
          const opts      = calcOptionsPrice(fType, duree, nbAccomp, has4canne);
          const basePrice = unitPrice * nb;
          total = basePrice + opts.accompPrice + opts.canne4Price + materielPrice;

          Object.assign(booking, {
            type:'peche', posteId, zone: zoneLabel, formule: rawFormule, formuleLabel, fType, dateDebut, duree, nb, dates,
            nbAccompagnants: nbAccomp,
            canne4: has4canne && fType !== 'demi',
            materiel: selectedMateriel, materielPrice,
            totalPrice: total,
          });

          const poste = posteId && typeof POSTES !== 'undefined' ? POSTES.find(p => p.id === posteId) : null;
          const posteLabel = poste ? `Poste #${posteId} — ${poste.nom}` : (zoneLabel || posteRaw);
          toastMsg = `🎣 Réservation enregistrée ! ${posteLabel} — ${total} €. Confirmation à ${email}.`;
        } else {
          total = unitPrice + materielPrice;
          Object.assign(booking, {
            type:'location', formule: rawFormule, formuleLabel, fType, dateDebut, duree, dates,
            materiel: selectedMateriel, materielPrice,
            totalPrice: total,
          });
          toastMsg = `✓ Réservation enregistrée ! ${ACTIVITY_LABELS[activity]} — ${formuleLabel} — ${total} €. Confirmation à ${email}.`;
        }
      }

      const submitBtn = bookingForm.querySelector('[type="submit"]');
      const origHtml  = submitBtn?.innerHTML;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<span>Envoi en cours…</span>'; }

      try {
        if (typeof LacDB !== 'undefined') await LacDB.addReservation(booking);
        showToast(toastMsg, 'success');
        bookingForm.reset();
        document.querySelectorAll('input[name="category"]').forEach(r => r.checked = false);
        document.querySelectorAll('input[name="activity"]').forEach(r => r.checked = false);
        const secAct = el('sec-activity'); if (secAct) secAct.hidden = true;
        // Reset all sections to hidden
        ['sec-poste','sec-formule','sec-calendar','sec-duree','sec-nb-pecheurs','sec-bateau','sec-emplacement','sec-options-peche','sec-materiel'].forEach(id => {
          const s = el(id); if (s) s.hidden = true;
        });
        if (el('sum-activite')) el('sum-activite').textContent = '—';
        if (el('sum-total'))    el('sum-total').textContent    = '—';
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        updateSummary();
      } catch (err) {
        console.error('[Réservation]', err);
        showToast('Erreur de connexion. Veuillez réessayer ou nous appeler.', 'error', '⚠️');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origHtml; }
      }
    });
  }

  // ── Soumission formulaire bateau (bateau.html) ────────────────
  const boatForm = el('boat-booking-form');
  if (boatForm) {
    boatForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const prenom  = el('bf-prenom')?.value.trim();
      const nom     = el('bf-nom')?.value.trim();
      const email   = el('bf-email')?.value.trim();
      const tel     = el('bf-tel')?.value.trim();
      const bateau  = el('bf-bateau')?.value;
      const formule = document.querySelector('input[name="bformule"]:checked')?.value;
      const date    = el('bf-date')?.value;
      const nb      = el('bf-nb')?.value;

      if (!prenom || !nom || !email || !tel || !bateau || !formule || !date) {
        showToast('Veuillez remplir tous les champs obligatoires.', 'error', '⚠️');
        return;
      }

      const basePrice    = BPRIX[formule] || 0;
      const nbPers       = parseInt(nb);
      const optCbs       = document.querySelectorAll('.boat-opt-cb:checked');
      const optionsTotal = Array.from(optCbs).reduce((sum, cb) => { const p = parseInt(cb.dataset.price)||0; return sum + (cb.dataset.flat==='true'?p:p*nbPers); }, 0);
      const total        = basePrice + optionsTotal;
      const selectedOpts = Array.from(optCbs).map(cb => cb.id);

      const booking = { type:'bateau', status:'pending', prenom, nom, email, tel, bateau, formule, date, nb: nbPers, options: selectedOpts, optionsPrice: optionsTotal, totalPrice: total };

      const submitBtn = boatForm.querySelector('[type="submit"]');
      const origHtml  = submitBtn?.innerHTML;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<span>Envoi en cours…</span>'; }

      try {
        if (typeof LacDB !== 'undefined') await LacDB.addReservation(booking);
        showToast(`🔥 Réservation enregistrée ! ${BLABELS[formule]} — ${total} € (${nbPers} pers.). Confirmation à ${email}.`, 'success', '🔥');
        boatForm.reset();
        const bdate = el('bf-date');
        if (bdate) bdate.min = new Date().toISOString().split('T')[0];
      } catch (err) {
        console.error('[Réservation bateau]', err);
        showToast('Erreur de connexion. Veuillez réessayer ou nous appeler.', 'error', '⚠️');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origHtml; }
      }
    });

    const bdateInput = el('bf-date');
    if (bdateInput) bdateInput.min = new Date().toISOString().split('T')[0];
  }

  // Mise à jour récapitulatif bateau (bateau.html)
  function updateBoatSummary() {
    const nb      = parseInt(el('bf-nb')?.value || 2);
    const formule = document.querySelector('input[name="bformule"]:checked')?.value;
    const bateau  = el('bf-bateau')?.value;
    const date    = el('bf-date')?.value;

    if (el('bsum-bateau'))  el('bsum-bateau').textContent  = bateau || '—';
    if (el('bsum-formule')) el('bsum-formule').textContent = formule ? (BLABELS[formule] || formule) : '—';
    if (el('bsum-date'))    el('bsum-date').textContent    = date ? formatDateFR(date) : '—';
    if (el('bsum-nb'))      el('bsum-nb').textContent      = `${nb} personnes`;

    if (formule) {
      const basePrice    = BPRIX[formule] || 0;
      const optCbs       = document.querySelectorAll('.boat-opt-cb:checked');
      const optionsTotal = Array.from(optCbs).reduce((sum, cb) => {
        const price = parseInt(cb.dataset.price) || 0;
        return sum + (cb.dataset.flat === 'true' ? price : price * nb);
      }, 0);
      const total        = basePrice + optionsTotal;
      const perPers      = nb > 0 ? Math.round(total / nb) : 0;
      if (el('bsum-total'))    el('bsum-total').textContent    = `${total} €`;
      if (el('bsum-unitaire')) el('bsum-unitaire').textContent = `${basePrice} € / bateau`;
      const optsLine = el('bsum-opts-line');
      if (optsLine) optsLine.style.display = optionsTotal > 0 ? '' : 'none';
      if (el('bsum-opts')) el('bsum-opts').textContent = optionsTotal > 0 ? `+${optionsTotal} €` : '—';
      if (el('bsum-par-pers-line')) el('bsum-par-pers-line').style.display = '';
      if (el('bsum-par-pers')) el('bsum-par-pers').textContent = `≈ ${perPers} €/pers.`;
    }
  }

  ['bf-bateau','bf-nb','bf-date'].forEach(id => {
    const e = el(id);
    if (e) e.addEventListener('change', updateBoatSummary);
  });
  document.querySelectorAll('input[name="bformule"]').forEach(r => r.addEventListener('change', updateBoatSummary));
  document.querySelectorAll('.boat-opt-cb').forEach(cb => cb.addEventListener('change', updateBoatSummary));

  updateSummary();
});
