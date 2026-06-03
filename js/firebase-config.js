// ================================================================
// Firebase Firestore — Base de données réservations
//
// Règles Firestore à configurer dans la console Firebase :
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /reservations/{id} {
//       allow create: if true;
//       allow read: if true;
//       allow update, delete: if request.auth != null;
//     }
//   }
// }
// ================================================================

const firebaseConfig = {
  apiKey: "AIzaSyAa3VmJepGZa7tcqWZ5Q3-qB-lkumfLmuA",
  authDomain: "lac-de-podensac.firebaseapp.com",
  projectId: "lac-de-podensac",
  storageBucket: "lac-de-podensac.firebasestorage.app",
  messagingSenderId: "467517432972",
  appId: "1:467517432972:web:8c073b85fbf3ee2ab9c7a9",
  measurementId: "G-PQPDGK4RYX"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const LacDB = {
  // Enregistrer une réservation
  async addReservation(booking) {
    booking.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    const ref = await db.collection('reservations').add(booking);
    return ref.id;
  },

  // Écouter en temps réel les dates réservées pour un poste donné
  watchPosteBookedDates(posteId, callback) {
    return db.collection('reservations')
      .where('posteId', '==', posteId)
      .onSnapshot(snap => {
        const confirmed = snap.docs
          .filter(d => d.data().status === 'confirmed')
          .flatMap(d => d.data().dates || []);
        const pending = snap.docs
          .filter(d => !d.data().status || d.data().status === 'pending')
          .flatMap(d => d.data().dates || []);
        callback({ confirmed, pending });
      }, err => {
        console.warn('[LacDB] Erreur lecture poste:', err.message);
        callback({ confirmed: [], pending: [] });
      });
  },

  // Écouter toutes les réservations (pour la carte et la page d'accueil)
  watchAllReservations(callback) {
    return db.collection('reservations').onSnapshot(snap => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, err => {
      console.warn('[LacDB] Erreur lecture globale:', err.message);
      callback([]);
    });
  },
};

window.LacDB = LacDB;
