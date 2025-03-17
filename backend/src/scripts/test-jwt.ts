import jwt from 'jsonwebtoken';
import config from '../config';

// Test JWT functionality
async function testJWT() {
  console.log('Testing JWT functionality...');

  // Create a payload
  const payload = {
    userId: '123',
    email: 'test@example.com',
    role: 'user'
  };

  // Sign a token
  const accessToken = jwt.sign(
    payload,
    config.jwt.accessTokenSecret,
    { expiresIn: '15m' }
  );

  console.log('Access Token:', accessToken);

  // Verify the token
  try {
    const decoded = jwt.verify(accessToken, config.jwt.accessTokenSecret);
    console.log('Decoded Token:', decoded);
  } catch (error) {
    console.error('Token verification failed:', error);
  }

  console.log('JWT test completed!');
}

// Run the test
testJWT(); 