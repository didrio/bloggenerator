const { describe, expect, it } = require('@jest/globals');
const { generateText } = require('../index');

const { wrap } = require('firebase-functions-test')({
  databaseURL: 'https://bloggenerator-ed7ed.firebaseio.com',
  storageBucket: 'bloggenerator-ed7ed.appspot.com',
  projectId: 'bloggenerator-ed7ed',
}, '../firebase-key.json');

describe('Cloud Functions', () => {
  describe('generateText function', () => {
    it('will do a thing', async () => {
      const wrappedFunction = wrap(generateText);

      const data = {
        messages: [{ 'role': 'user', 'content': 'Write a short blog post title about AI' }],
        temperature: 0.7,
      };
      const context = {
        auth: {
          uid: 'testUser',
        },
      };

      try {
        const result = await wrappedFunction(data, context);
        expect(result.text).toBeDefined();
      } catch (error) {
        console.error('Error testing generateText function:', error);
        throw error;
      }
    });
  });
});
