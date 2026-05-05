// =====================================================
//  STEP 1: Replace these values with your Firebase
//  project settings (from Firebase Console)
// =====================================================
const firebaseConfig = {
  apiKey: "AIzaSyAP92HeEDvQRRS8kCoq7YNADo3sm36fjP4",
  authDomain: "ad-benny.firebaseapp.com",
  projectId: "ad-benny",
  storageBucket: "ad-benny.firebasestorage.app",
  messagingSenderId: "246481928920",
  appId: "1:246481928920:web:67fee5a643a880e9ffcdad"
};


// Only this Google account can access the admin panel — put Benny's Gmail here
const ADMIN_EMAIL = "donpaul4444@gmail.com";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.firestore();
