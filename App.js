import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, Keyboard } from 'react-native';
import { signInAnonymously } from 'firebase/auth';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { auth } from './firebase';
import useFunctions from './hooks/useFunctions';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const { callFunction } = useFunctions();

  const onChangePrompt = (text) => setPrompt(text);

  const handleGenerate = async () => {
    Keyboard.dismiss();
    if (auth.currentUser) {
      const data = {
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      };
      const result = await callFunction('generateText', data);
      setResponse(result.text);
    }
  };

  useEffect(() => {
    signInAnonymously(auth);
  }, []);

  return (
    <KeyboardAwareScrollView style={styles.container} keyboardShouldPersistTaps="always">
      <View style={styles.view}>
        <Text>Prompt</Text>
        <TextInput
          onChangeText={onChangePrompt}
          placeholder="Prompt..."
          value={prompt}
          multiline={true}
          numberOfLines={6}
        />
        <TouchableOpacity onPress={handleGenerate} style={styles.generateButton}>
          <Text style={styles.generateButtonText}>Generate</Text>
        </TouchableOpacity>
        {response ? (
          <View style={styles.responseContainer}>
            <Text>{`Response: ${response}`}</Text>
          </View>
        ) : null}
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 20,
  },
  view: {
    marginTop: 60,
  },
  responseContainer: {
    marginTop: 50,
  },
  generateButton: {
    backgroundColor: 'black',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 200,
  },
  generateButtonText: {
    color: 'white',
  },
});
