const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
// const { getFirestore } = require('firebase-admin/firestore');
const { Configuration, OpenAIApi } = require('openai');

initializeApp();
// const app = initializeApp();
// const firestore = getFirestore(app);

const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

exports.generateText = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { messages, temperature } = data;

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: temperature,
    });

    const text = completion.data.choices[0].message.content.trim();

    return { text };
  } catch (error) {
    console.error('Error generating post:', error);
    throw new functions.https.HttpsError('unknown', 'Failed to generate post.');
  }
});

// Cloud Function to simulate user subscription (to be replaced with actual in-app purchase functionality later)
// exports.subscribeUser = functions.https.onCall(async (data, context) => {
//   if (!context.auth) {
//     throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
//   }

//   const uid = context.auth.uid;
//   const userRef = firestore.collection('users').doc(uid);

//   await userRef.update({ hasSubscription: true });

//   return { success: true };
// });

// Cloud Function to simulate user unsubscription (to be replaced with actual in-app purchase functionality later)
// exports.unsubscribeUser = functions.https.onCall(async (data, context) => {
//   if (!context.auth) {
//     throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
//   }

//   const uid = context.auth.uid;
//   const userRef = firestore.collection('users').doc(uid);

//   await userRef.update({ hasSubscription: false });

//   return { success: true };
// });
