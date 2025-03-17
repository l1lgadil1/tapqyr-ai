import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import authService from '../services/auth-service';
import { generateTokens } from '../utils/token-utils';
import logger from '../utils/logger';

/**
 * Test script to verify the authentication system
 */
async function testAuth() {
  try {
    logger.info('Starting authentication test...');

    // Test user data
    const testUser = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User'
    };

    // Clean up any existing test user
    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email }
    });

    if (existingUser) {
      logger.info(`Deleting existing test user: ${existingUser.email}`);
      await prisma.user.delete({
        where: { id: existingUser.id }
      });
    }

    // Test registration
    logger.info('Testing user registration...');
    const registeredUser = await authService.register(
      testUser.email,
      testUser.password,
      testUser.name
    );
    logger.info(`User registered: ${JSON.stringify(registeredUser)}`);

    // Test login
    logger.info('Testing user login...');
    const loginResult = await authService.login(
      testUser.email,
      testUser.password
    );
    logger.info(`User logged in: ${JSON.stringify(loginResult.user)}`);
    logger.info(`Access token: ${loginResult.tokens.accessToken}`);
    logger.info(`Refresh token: ${loginResult.tokens.refreshToken}`);

    // Test token validation
    logger.info('Testing token validation...');
    const tokenPayload = authService.validateToken(loginResult.tokens.accessToken);
    logger.info(`Token payload: ${JSON.stringify(tokenPayload)}`);

    // Test token refresh
    logger.info('Testing token refresh...');
    const refreshedTokens = await authService.refreshTokens(loginResult.tokens.refreshToken);
    logger.info(`Refreshed access token: ${refreshedTokens.accessToken}`);
    logger.info(`Refreshed refresh token: ${refreshedTokens.refreshToken}`);

    // Test password change
    logger.info('Testing password change...');
    const newPassword = 'NewPassword456!';
    await authService.changePassword(
      registeredUser.id,
      testUser.password,
      newPassword
    );
    logger.info('Password changed successfully');

    // Test login with new password
    logger.info('Testing login with new password...');
    const newLoginResult = await authService.login(
      testUser.email,
      newPassword
    );
    logger.info(`User logged in with new password: ${JSON.stringify(newLoginResult.user)}`);

    // Test logout
    logger.info('Testing logout...');
    await authService.logout(registeredUser.id);
    logger.info('User logged out successfully');

    // Clean up test user
    logger.info('Cleaning up test user...');
    await prisma.user.delete({
      where: { id: registeredUser.id }
    });
    logger.info('Test user deleted');

    logger.info('Authentication test completed successfully!');
  } catch (error) {
    logger.error(`Authentication test failed: ${(error as Error).message}`);
    logger.error((error as Error).stack || '');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAuth(); 