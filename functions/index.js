const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

// Replace this with your OpenAI API key
const OPENAI_API_KEY = "your-openai-api-key";

const OPENAI_API_URL = "https://api.openai.com/v1/engines/davinci-codex/completions";

const auth = admin.auth();
const db = admin.firestore();

// Cloud Function to generate a blog post
exports.generatePost = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const uid = context.auth.uid;

  // Check if the user has a subscription or has used their daily free post
  const userRef = db.collection("users").doc(uid);
  const userDoc = await userRef.get();

  const hasSubscription = userDoc.get("hasSubscription");
  const lastGeneratedPost = userDoc.get("lastGeneratedPost");
  const today = new Date().setHours(0, 0, 0, 0);

  if (!hasSubscription && lastGeneratedPost && lastGeneratedPost.toMillis() >= today) {
    throw new functions.https.HttpsError("resource-exhausted", "User has already used their free daily post.");
  }

  // Call OpenAI API
  const { summary, temperature, tone, subject, humanLike } = data;

  const prompt = `${subject} (${tone})\n\n${summary}\n`;

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        prompt,
        temperature,
        max_tokens: 1024,
        n: 1,
        stop: null,
        echo: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
      },
    );

    const generatedPost = response.data.choices[0].text.trim();

    // Update user's lastGeneratedPost field
    await userRef.update({ lastGeneratedPost: admin.firestore.Timestamp.now() });

    return { generatedPost };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new functions.https.HttpsError("internal", "Error generating blog post.");
  }
});

// Cloud Function to simulate user subscription (to be replaced with actual in-app purchase functionality later)
exports.subscribeUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const uid = context.auth.uid;
  const userRef = db.collection("users").doc(uid);

  await userRef.update({ hasSubscription: true });

  return { success: true };
});

// Cloud Function to simulate user unsubscription (to be replaced with actual in-app purchase functionality later)
exports.unsubscribeUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }

  const uid = context.auth.uid;
  const userRef = db.collection('users').doc(uid);

  await userRef.update({ hasSubscription: false });

  return { success: true };
});
