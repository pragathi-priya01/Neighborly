import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { AuthService } from '../src/services/authService.js';
import { User } from '../src/models/User.js';

describe('Authentication & RBAC Suite', () => {
  before(async () => {
    await connectDB();
  });

  after(async () => {
    await disconnectDB();
  });

  const testEmail = `test_resident_${Date.now()}@neighbourly.local`;

  it('should register a new resident user with hashed password', async () => {
    const result = await AuthService.register({
      name: 'Rohan Verma',
      email: testEmail,
      password: 'SecurePassword@123',
      role: 'RESIDENT',
      phone: '+91 99999 11111',
      neighborhood: 'Indiranagar',
    });

    assert.ok(result.token, 'Token should be returned');
    assert.equal(result.user.email, testEmail);
    assert.equal(result.user.role, 'RESIDENT');

    // Verify password is not stored in plaintext
    const dbUser = await User.findOne({ email: testEmail });
    assert.notEqual(dbUser.passwordHash, 'SecurePassword@123');
  });

  it('should reject registration with duplicate email', async () => {
    await assert.rejects(
      async () => {
        await AuthService.register({
          name: 'Duplicate Rohan',
          email: testEmail,
          password: 'Password@123',
          role: 'RESIDENT',
        });
      },
      {
        message: /already exists/i,
      }
    );
  });

  it('should login successfully with valid credentials', async () => {
    const result = await AuthService.login({
      email: testEmail,
      password: 'SecurePassword@123',
    });

    assert.ok(result.token);
    assert.equal(result.user.email, testEmail);
  });

  it('should reject login with wrong password', async () => {
    await assert.rejects(
      async () => {
        await AuthService.login({
          email: testEmail,
          password: 'WrongPassword@999',
        });
      },
      {
        message: /invalid email or password/i,
      }
    );
  });
});
