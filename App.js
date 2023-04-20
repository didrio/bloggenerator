import React, { useState, useEffect } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Linking,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [temperature, setTemperature] = useState('0.7');
  const [tone, setTone] = useState('');
  const [subject, setSubject] = useState('');
  const [humanLike, setHumanLike] = useState('');
  const [summary, setSummary] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [incompletePost, setIncompletePost] = useState('');
  const [isEarlyEnd, setIsEarlyEnd] = useState(false);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const storedApiKey = await AsyncStorage.getItem('apiKey');
        if (storedApiKey) {
          setApiKey(storedApiKey);
        }
      } catch (error) {
        Alert.alert('Error', 'An error occurred while loading the API key from local storage.');
      }
    };

    loadApiKey();
  }, []);

  const openAPIKeyPage = async () => {
    await WebBrowser.openBrowserAsync('https://platform.openai.com/signup');
  };

  const generatePost = async () => {
    try {
      const prompt = `Subject: ${subject}\nTone: ${tone}\nSummary: ${summary}\nTemperature: ${temperature}\nHuman-like: ${humanLike}\n\nGenerate a blog post:`;

      const response = await axios.post(
        'https://api.openai.com/v1/engines/davinci-codex/completions',
        {
          prompt,
          max_tokens: 1024,
          n: 1,
          stop: null,
          temperature: parseFloat(temperature),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      if (response.data && response.data.choices && response.data.choices[0].text) {
        const generatedContent = response.data.choices[0].text;
        const isEarlyEnd = !generatedContent.trim().endsWith('.') && !generatedContent.trim().endsWith('!') && !generatedContent.trim().endsWith('?');

        if (isEarlyEnd) {
          setIncompletePost(generatedContent);
          setGeneratedPost('');
        } else {
          setGeneratedPost(generatedContent);
          setIncompletePost('');
        }
      } else {
        Alert.alert('Error', 'Unable to generate the blog post. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while generating the blog post. Please check your API key and input parameters.');
    }
  };

  const fixPost = async () => {
    try {
      const prompt = `Continue the blog post:\n\n${incompletePost}`;

      const response = await axios.post(
        'https://api.openai.com/v1/engines/davinci-codex/completions',
        {
          prompt,
          max_tokens: 1024,
          n: 1,
          stop: null,
          temperature: parseFloat(temperature),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      if (response.data && response.data.choices && response.data.choices[0].text) {
        setGeneratedPost(incompletePost + response.data.choices[0].text);
        setIncompletePost('');
      } else {
        Alert.alert('Error', 'Unable to generate the remaining content. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while generating the remaining content. Please check your API key and input parameters.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>OpenAI API Key:</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={setApiKey}
          value={apiKey}
          placeholder="Enter your OpenAI API Key"
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={openAPIKeyPage} style={styles.linkButton}>
          <Text style={styles.linkButtonText}>Get API Key</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Temperature:</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={setTemperature}
          value={temperature}
          placeholder="Enter temperature (0-1)"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tone:</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={setTone}
          value={tone}
          placeholder="Enter tone"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Subject:</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={setSubject}
          value={subject}
          placeholder="Enter subject"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Human-like:</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={setHumanLike}
          value={humanLike}
          placeholder="Enter human-like level"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Summary:</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={setSummary}
          value={summary}
          placeholder="Enter a summary of the blog post"
          multiline
        />
      </View>

      <TouchableOpacity onPress={generatePost} style={styles.generateButton}>
        <Text style={styles.generateButtonText}>Generate</Text>
      </TouchableOpacity>

      {generatedPost ? (
        <View style={styles.generatedPostContainer}>
          <Text style={styles.generatedPost}>{generatedPost}</Text>
        </View>
      ) : null}

      {incompletePost && (
        <TouchableOpacity onPress={fixPost} style={styles.fixButton}>
          <Text style={styles.fixButtonText}>Fix</Text>
        </TouchableOpacity>
      )}


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  linkButton: {
    marginTop: 10,
  },
  linkButtonText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  generatedPostContainer: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    borderRadius: 5,
  },
  generatedPost: {
    fontSize: 16,
  },
  fixButton: {
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  fixButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

