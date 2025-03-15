import OpenAI from 'openai';
import config from './config';

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API connection...');
    console.log(`Using API key: ${config.openai.apiKey.substring(0, 10)}...`);
    
    const openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, are you working?' }
      ],
      max_tokens: 50,
    });
    
    console.log('OpenAI API connection successful!');
    console.log('Response:', response.choices[0]?.message?.content);
  } catch (error) {
    console.error('Error testing OpenAI API:', error);
  }
}

testOpenAI(); 