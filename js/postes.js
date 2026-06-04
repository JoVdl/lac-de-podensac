// ================================================================
// Données des postes de pêche — Lac de Podensac
// Coordonnées réelles extraites de la carte Google Maps du lac
// ================================================================

// Tarifs pêche par pêcheur (source : flyer officiel)
const TARIFS_NUITS = { 1: 35, 2: 70, 3: 90, 4: 110, 5: 130, 6: 150, 7: 170 };
const TARIF_JOUR  = 20;  // Journée 12h
const TARIF_DEMI  = 15;  // Demi-journée

// Cartes (multi-sessions)
const CARTES_NUITS = [
  { label: "Carte 5 nuitées",  prix: 160 },
  { label: "Carte 10 nuitées", prix: 300 },
  { label: "Carte 20 nuitées", prix: 550 },
];
const CARTES_JOURS = [
  { label: "Carte 5 journées",  prix: 95  },
  { label: "Carte 10 journées", prix: 180 },
  { label: "Carte 20 journées", prix: 350 },
];

// Tarifs groupe (5 pêcheurs et plus)
const TARIFS_GROUPE = { demi: 10, jour: 15, nuit: 25 };

// Accompagnants (hors pêcheur, conjoint, enfant) — par personne
const TARIF_ACCOMPAGNANT = { demi: 5, jour: 10, nuit: 10 }; // ×nbNuits pour les séjours nuit
// 4ème canne (3 incluses par défaut) — formule max(20, duree×10) pour les nuits
const TARIF_4EME_CANNE = { jour: 10, nuit: 20 };

// Privatisation du plan d'eau
const TARIF_PRIVAT = 400;

// Location de matériel (tarifs par session)
const LOCATION_MATERIEL = [
  { id: 'canne-carpe',   label: 'Canne carpe + moulinet',     emoji: '🎣', prix_jour: 8,  prix_nuit: 12, note: '12ft, 3lb TC' },
  { id: 'canne-carnass', label: 'Canne carnassier + moulinet', emoji: '🎣', prix_jour: 8,  prix_nuit: 12, note: 'Sans leurres' },
  { id: 'canne-feeder',  label: 'Canne feeder complète',       emoji: '🎣', prix_jour: 5,  prix_nuit: 8,  note: 'Feeder fourni' },
  { id: 'epuisette',     label: 'Épuisette carpe',              emoji: '🪣', prix_jour: 3,  prix_nuit: 5,  note: 'Grande taille' },
  { id: 'tapis',         label: 'Tapis de réception',           emoji: '🟫', prix_jour: 2,  prix_nuit: 3,  note: 'Obligatoire carpe' },
  { id: 'sac-garde',     label: 'Sac de conservation',          emoji: '🫙', prix_jour: 3,  prix_nuit: 5,  note: 'No-kill' },
  { id: 'pod',           label: 'Pod + 3 repose-cannes',        emoji: '⚙️', prix_jour: 5,  prix_nuit: 8,  note: '' },
  { id: 'detecteurs',    label: 'Détecteurs × 3 + boîtier',    emoji: '🔔', prix_jour: 8,  prix_nuit: 12, note: '' },
  { id: 'chaise',        label: 'Chaise inclinable pêche',      emoji: '🪑', prix_jour: 5,  prix_nuit: 8,  note: '' },
  { id: 'bivouac',       label: 'Bivouac (abri de pêche)',      emoji: '⛺', prix_jour: 12, prix_nuit: 15, note: '' },
  { id: 'sac-couchage',  label: 'Sac de couchage',              emoji: '🛏️', prix_jour: 8,  prix_nuit: 10, note: '' },
  { id: 'kit-photo',     label: 'Kit photo (carton + marqueur)',emoji: '📸', prix_jour: 2,  prix_nuit: 2,  note: 'Inclus si demandé' },
  { id: 'kayak',         label: 'Kayak',                        emoji: '🛶', prix_jour: 20, prix_demi: 15, prix_nuit: 20, note: '15€ demi-j.' },
  { id: 'barque-moteur', label: 'Barque + moteur + batterie',   emoji: '⛵', prix_jour: 30, prix_demi: 20, prix_nuit: 30, note: '20€ demi-j. — dégressif multi-jours' },
  { id: 'sondeur',       label: 'Sondeur de pêche',             emoji: '📡', prix_jour: 30, prix_nuit: 30, note: 'Journée uniquement' },
];
window.LOCATION_MATERIEL = LOCATION_MATERIEL;

const POSTES = [
  {
    id: 1,
    nom: "Poste 1",
    image: 'images/poste 1.jpg',
    lat: 44.6513675, lng: -0.3413005,
    icon: "🌿",
    description: "Premier poste sur la rive, idéal pour 1 à 2 pêcheurs. Accès facile depuis le parking principal. Accessible en véhicule à la belle saison.",
    poissons: ["Carpe", "Gardon", "Esturgeon", "Brochet", "Silure", "Black-bass", "Sandre", "Perche", "Brème"],
    difficulte: "Facile",
    profondeur: "1.5–7m",
    fond: "Grave / Herbe / Vase",
    capacite: 2,
    prix_demi: 15, prix_jour: 20, prix_nuit: 35,
    disponible: true,
    score: 4.6, avis: 38, acces_pmr: false,
    captures: [
      { espece: "Carpe",  poids: "8.4kg",  date: "12 mai 2025", emoji: "🐟" },
      { espece: "Tanche", poids: "1.2kg",  date: "5 mai 2025",  emoji: "🐟" },
      { espece: "Carpe",  poids: "11.3kg", date: "28 avr. 2025", emoji: "🐟" },
      { espece: "Brème",  poids: "0.8kg",  date: "20 avr. 2025", emoji: "🐟" },
    ],
    equipements: ["Accessible en véhicule (belle saison)", "Barbecue sur demande à l'accueil"],
    zone_ha: 1.20, note: "Zone de pêche à la nuitée — 1,20 ha",
  },
  {
    id: 2,
    nom: "Poste 2",
    image: 'images/poste 2.jpg',
    lat: 44.6518999, lng: -0.342419,
    icon: "🪴",
    description: "Poste spacieux entouré de végétation, excellent pour la pêche à la carpe de nuit. Zone de 1,27 ha réservée.",
    poissons: ["Carpe", "Gardon", "Esturgeon", "Brochet", "Silure", "Black-bass", "Sandre", "Perche", "Brème"],
    difficulte: "Facile",
    profondeur: "1.5–7m",
    fond: "Grave / Herbe / Vase",
    capacite: 2,
    prix_demi: 15, prix_jour: 20, prix_nuit: 35,
    disponible: false,
    score: 4.4, avis: 52, acces_pmr: false,
    captures: [
      { espece: "Tanche", poids: "2.1kg", date: "15 mai 2025", emoji: "🐟" },
      { espece: "Carpe",  poids: "9.7kg", date: "10 mai 2025", emoji: "🐟" },
      { espece: "Brème",  poids: "1.4kg", date: "3 mai 2025",  emoji: "🐟" },
      { espece: "Gardon", poids: "0.3kg", date: "25 avr. 2025", emoji: "🐟" },
    ],
    equipements: ["Accessible en véhicule (belle saison)", "Barbecue sur demande à l'accueil"],
    zone_ha: 1.27, note: "Zone de pêche à la nuitée — 1,27 ha",
  },
  {
    id: 3,
    nom: "Poste 3",
    image: 'images/Poste 3.jpg',
    lat: 44.6525002, lng: -0.3434805,
    icon: "🦆",
    description: "Poste en rive nord avec une belle vue sur le lac. Idéal pour les carnassiers le soir et tôt le matin. Zone de 1,22 ha.",
    poissons: ["Carpe", "Gardon", "Esturgeon", "Brochet", "Silure", "Black-bass", "Sandre", "Perche", "Brème"],
    difficulte: "Intermédiaire",
    profondeur: "1.5–7m",
    fond: "Grave / Herbe / Vase",
    capacite: 2,
    prix_demi: 15, prix_jour: 20, prix_nuit: 35,
    disponible: true,
    score: 4.5, avis: 27, acces_pmr: false,
    captures: [
      { espece: "Sandre",  poids: "3.8kg", date: "18 mai 2025", emoji: "🐟" },
      { espece: "Brochet", poids: "4.2kg", date: "14 mai 2025", emoji: "🐟" },
      { espece: "Perche",  poids: "0.9kg", date: "8 mai 2025",  emoji: "🐟" },
      { espece: "Sandre",  poids: "5.1kg", date: "1 mai 2025",  emoji: "🐟" },
    ],
    equipements: ["Accessible en véhicule (belle saison)", "Barbecue sur demande à l'accueil"],
    zone_ha: 1.22, note: "Zone de pêche à la nuitée — 1,22 ha",
  },
  {
    id: 4,
    nom: "Poste 4",
    image: 'poste 4.jpg',
    lat: 44.6530008, lng: -0.3446801,
    icon: "⚓",
    description: "Poste bien équipé, fond favorable à la carpe. Zone de 1,33 ha, idéale pour les séances longues.",
    poissons: ["Carpe", "Gardon", "Esturgeon", "Brochet", "Silure", "Black-bass", "Sandre", "Perche", "Brème"],
    difficulte: "Facile",
    profondeur: "1.5–7m",
    fond: "Grave / Herbe / Vase",
    capacite: 2,
    prix_demi: 15, prix_jour: 20, prix_nuit: 35,
    disponible: true,
    score: 4.3, avis: 44, acces_pmr: false,
    captures: [
      { espece: "Carpe",   poids: "7.6kg",  date: "20 mai 2025", emoji: "🐟" },
      { espece: "Brème",   poids: "1.1kg",  date: "16 mai 2025", emoji: "🐟" },
      { espece: "Tanche",  poids: "1.8kg",  date: "12 mai 2025", emoji: "🐟" },
      { espece: "Sandre",  poids: "3.2kg",  date: "7 mai 2025",  emoji: "🐟" },
    ],
    equipements: ["Accessible en véhicule (belle saison)", "Barbecue sur demande à l'accueil"],
    zone_ha: 1.33, note: "Zone de pêche à la nuitée — 1,33 ha",
  },
  {
    id: 5,
    nom: "Poste 5",
    image: 'images/poste 5.jpg',
    lat: 44.6534109, lng: -0.3455524,
    icon: "🎣",
    description: "Grand poste de 1,82 ha offrant de belles perspectives de captures. Zone variée avec fonds de grave, herbe et vase.",
    poissons: ["Carpe", "Gardon", "Esturgeon", "Brochet", "Silure", "Black-bass", "Sandre", "Perche", "Brème"],
    difficulte: "Intermédiaire",
    profondeur: "1.5–7m",
    fond: "Grave / Herbe / Vase",
    capacite: 2,
    prix_demi: 15, prix_jour: 20, prix_nuit: 35,
    disponible: true,
    score: 4.0, avis: 5, acces_pmr: false,
    captures: [
      { espece: "Carpe",       poids: "10.2kg", date: "2025", emoji: "🐟" },
      { espece: "Amour blanc", poids: "8.5kg",  date: "2025", emoji: "🐟" },
      { espece: "Tanche",      poids: "2.1kg",  date: "2025", emoji: "🐟" },
      { espece: "Carpe",       poids: "13.0kg", date: "2025", emoji: "🐟" },
    ],
    equipements: ["Accessible en véhicule (belle saison)", "Barbecue sur demande à l'accueil"],
    zone_ha: 1.82, note: "Zone 1,82 ha",
  },
  {
    id: 6,
    nom: "Poste 6",
    image: 'images/poste 6 (3).jpg',
    lat: 44.6539859, lng: -0.3473511,
    icon: "🌊",
    description: "Grand poste de 2,52 ha, le plus vaste du lac. Vue panoramique sur toute la longueur du lac. Zone à la nuitée.",
    poissons: ["Carpe", "Gardon", "Esturgeon", "Brochet", "Silure", "Black-bass", "Sandre", "Perche", "Brème"],
    difficulte: "Intermédiaire",
    profondeur: "1.5–7m",
    fond: "Grave / Herbe / Vase",
    capacite: 3,
    prix_demi: 15, prix_jour: 20, prix_nuit: 35,
    disponible: true,
    score: 4.7, avis: 61, acces_pmr: false,
    captures: [
      { espece: "Carpe",       poids: "14.8kg", date: "21 mai 2025", emoji: "🐟" },
      { espece: "Sandre",      poids: "4.7kg",  date: "17 mai 2025", emoji: "🐟" },
      { espece: "Brochet",     poids: "5.2kg",  date: "13 mai 2025", emoji: "🐟" },
      { espece: "Silure",      poids: "18.5kg", date: "9 mai 2025",  emoji: "🐟" },
    ],
    equipements: ["Accessible en véhicule (belle saison)", "Barbecue sur demande à l'accueil"],
    zone_ha: 2.52, note: "Zone de pêche à la nuitée — 2,52 ha — 2 à 3 pêcheurs",
  },
  {
    id: 7,
    nom: "Poste 7 — Ponton Bois",
    image: 'images/poste 7 ponton.jpg',
    lat: 44.6526519, lng: -0.3495224,
    icon: "🪵",
    description: "Poste avec ponton en bois de 22m². Plateforme stable et confortable surplombant l'eau. Accès direct depuis le parking central.",
    poissons: ["Carpe", "Gardon", "Esturgeon", "Brochet", "Silure", "Black-bass", "Sandre", "Perche", "Brème"],
    difficulte: "Facile",
    profondeur: "1.5–7m",
    fond: "Grave / Herbe / Vase",
    capacite: 2,
    prix_demi: 15, prix_jour: 20, prix_nuit: 35,
    disponible: true,
    score: 4.8, avis: 73, acces_pmr: true,
    captures: [
      { espece: "Carpe",  poids: "12.1kg", date: "22 mai 2025", emoji: "🐟" },
      { espece: "Tanche", poids: "2.4kg",  date: "18 mai 2025", emoji: "🐟" },
      { espece: "Brème",  poids: "1.9kg",  date: "14 mai 2025", emoji: "🐟" },
      { espece: "Perche", poids: "0.8kg",  date: "10 mai 2025", emoji: "🐟" },
    ],
    equipements: ["Accessible en véhicule (belle saison)", "Barbecue sur demande à l'accueil"],
    note: "Ponton bois 22m² — Accès voiture possible",
  },
  {
    id: 8,
    nom: "Poste 8 — Des Barques",
    lat: 44.6533971, lng: -0.3515996,
    icon: "⛵",
    description: "Poste situé près de l'aire des barques. En cours de finalisation. Accès aux embarcations (barques, canoës) à proximité immédiate.",
    poissons: ["Carpe", "Gardon", "Esturgeon", "Brochet", "Silure", "Black-bass", "Sandre", "Perche", "Brème"],
    difficulte: "Intermédiaire",
    profondeur: "1.5–7m",
    fond: "Grave / Herbe / Vase",
    capacite: 2,
    prix_demi: 15, prix_jour: 20, prix_nuit: 35,
    disponible: false,
    score: 4.2, avis: 12, acces_pmr: false,
    captures: [
      { espece: "Carpe",   poids: "9.3kg", date: "20 mai 2025", emoji: "🐟" },
      { espece: "Sandre",  poids: "3.6kg", date: "16 mai 2025", emoji: "🐟" },
      { espece: "Anguille",poids: "1.7kg", date: "11 mai 2025", emoji: "🐍" },
      { espece: "Carpe",   poids: "7.8kg", date: "5 mai 2025",  emoji: "🐟" },
    ],
    equipements: ["Accessible en véhicule (belle saison)", "Barbecue sur demande à l'accueil"],
    note: "Poste pas encore terminé — proche de l'aire barques",
    coming_soon: true,
  },
  {
    id: 9,
    nom: "Poste 9 — De la Cale",
    image: 'images/poste de la cale.jpg',
    lat: 44.653821, lng: -0.3522097,
    icon: "🏗️",
    description: "Poste accessible en voiture toute l'année grâce à sa rampe bétonnée. Idéal pour les pêcheurs qui amènent beaucoup de matériel. Proche des sanitaires.",
    poissons: ["Carpe", "Gardon", "Esturgeon", "Brochet", "Silure", "Black-bass", "Sandre", "Perche", "Brème"],
    difficulte: "Facile",
    profondeur: "1.5–7m",
    fond: "Grave / Herbe / Vase",
    capacite: 2,
    prix_demi: 15, prix_jour: 20, prix_nuit: 35,
    disponible: true,
    score: 4.5, avis: 29, acces_pmr: false,
    captures: [
      { espece: "Carpe",  poids: "11.5kg", date: "23 mai 2025", emoji: "🐟" },
      { espece: "Tanche", poids: "2.0kg",  date: "19 mai 2025", emoji: "🐟" },
      { espece: "Sandre", poids: "4.1kg",  date: "15 mai 2025", emoji: "🐟" },
      { espece: "Brème",  poids: "1.6kg",  date: "9 mai 2025",  emoji: "🐟" },
    ],
    equipements: ["Accessible en véhicule (belle saison)", "Barbecue sur demande à l'accueil"],
    note: "Accès possible toute l'année en voiture",
  },
  {
    id: 10,
    nom: "Poste 10 — Des Iris",
    image: 'images/poste des iris.jpg',
    lat: 44.6541539, lng: -0.3527693,
    icon: "🌸",
    description: "Poste nommé pour ses magnifiques iris en fleurs au printemps. Zone 'toutes pêches' à proximité — carnassiers et pêche de rive. L'un des plus esthétiques du lac.",
    poissons: ["Carpe", "Gardon", "Esturgeon", "Brochet", "Silure", "Black-bass", "Sandre", "Perche", "Brème"],
    difficulte: "Intermédiaire",
    profondeur: "1.5–7m",
    fond: "Grave / Herbe / Vase",
    capacite: 2,
    prix_demi: 15, prix_jour: 20, prix_nuit: 35,
    disponible: true,
    score: 4.9, avis: 41, acces_pmr: false,
    captures: [
      { espece: "Sandre",  poids: "6.8kg",  date: "22 mai 2025", emoji: "🐟" },
      { espece: "Brochet", poids: "7.4kg",  date: "17 mai 2025", emoji: "🐟" },
      { espece: "Carpe",   poids: "16.2kg", date: "12 mai 2025", emoji: "🏆" },
      { espece: "Anguille",poids: "2.1kg",  date: "6 mai 2025",  emoji: "🐍" },
    ],
    equipements: ["Accessible en véhicule (belle saison)", "Barbecue sur demande à l'accueil"],
    note: "Accès à 30m en voiture — Zone toutes pêches à proximité",
    premium: true,
  },
];

// Équipements & points d'intérêt du lac
const AMENITIES = [
  { id: 'parking', nom: 'Parking',                   lat: 44.6529252, lng: -0.352212,  icon: '🅿️', desc: 'Parking principal — Merci de garer vos véhicules ici' },
  { id: 'wc',      nom: 'Toilettes',                  lat: 44.6533223, lng: -0.3519412, icon: '🚻', desc: 'Sanitaires disponibles' },
  { id: 'picnic1', nom: 'Table pique-nique & BBQ',    lat: 44.6532783, lng: -0.3513988, icon: '🍖', desc: 'Table de pique-nique avec barbecue' },
  { id: 'picnic2', nom: 'Table de pique-nique',       lat: 44.6537412, lng: -0.3522097, icon: '🌳', desc: 'Table de pique-nique' },
  { id: 'barques', nom: 'Barques & Canoës',           lat: 44.6535353, lng: -0.3515685, icon: '🛶', desc: 'Location de barques et canoës' },
  { id: 'rampe',   nom: "Rampe de mise à l'eau",      lat: 44.6537339, lng: -0.3519588, icon: '⛵', desc: "Rampe bétonnée — accès toute l'année" },
];

const LAC_CENTER = [44.6528, -0.3470];
const LAC_ZOOM   = 15;

window.POSTES       = POSTES;
window.AMENITIES    = AMENITIES;
window.LAC_CENTER   = LAC_CENTER;
window.LAC_ZOOM     = LAC_ZOOM;
window.TARIFS_NUITS = TARIFS_NUITS;
window.TARIF_JOUR   = TARIF_JOUR;
window.TARIF_DEMI   = TARIF_DEMI;
