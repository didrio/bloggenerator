const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyCizmEStDfg5vRRJbZejFgY3N4iCdihXHE",
  authDomain: "bloggenerator-ed7ed.firebaseapp.com",
  projectId: "bloggenerator-ed7ed",
  storageBucket: "bloggenerator-ed7ed.appspot.com",
  messagingSenderId: "465064074857",
  appId: "1:465064074857:web:4f5a972a5137ba6ea48cf8",
  measurementId: "G-J7YVMFPKYW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function getIdToken() {
  const email = 'abhpro@gmail.com';
  const password = 'abhpro';

  try {
    // Sign in with email and password (you can replace this with signInWithCustomToken if you have a custom token)
    const signInResult = await signInWithEmailAndPassword(auth, email, password);

    // Get the ID token for the signed-in user
    const idToken = await signInResult.user.getIdToken();
    console.log('ID token:', idToken);

    // Sign out after obtaining the token
    await signOut(auth);
  } catch (error) {
    console.error('Error getting ID token:', error);
  }
}

getIdToken();
