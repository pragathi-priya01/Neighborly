import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { AuthService } from '../src/services/authService.js';
import { AdminService } from '../src/services/adminService.js';
import { User } from '../src/models/User.js';
import { authorize } from '../src/middleware/auth.js';

describe('Admin Governance & Role Protection Suite', () => {
  before(async () => {
    await connectDB();
  });

  after(async () => {
    await disconnectDB();
  });

  it('1. Admin should authenticate successfully with provisioned credentials', async () => {
    const res = await AuthService.login({
      email: 'admin@neighbourly.local',
      password: 'Admin@1234',
    });

    assert.ok(res.token, 'Token must be issued');
    assert.equal(res.user.role, 'ADMIN', 'Role must be ADMIN');
    assert.equal(res.user.email, 'admin@neighbourly.local');
  });

  it('2. Public registration must reject or sanitize role escalation to ADMIN', async () => {
    const maliciousEmail = `hacker_${Date.now()}@neighbourly.local`;
    const regRes = await AuthService.register({
      name: 'Fake Admin',
      email: maliciousEmail,
      password: 'HackerPassword@123',
      role: 'ADMIN', // Attempt privilege escalation
      neighborhood: 'Indiranagar',
    });

    // Clean up created test user
    await User.findByIdAndDelete(regRes.user._id);

    // AuthService.register enforces safeRole: only 'PROVIDER' or 'RESIDENT'
    assert.notEqual(regRes.user.role, 'ADMIN', 'Must NOT allow ADMIN role through register');
    assert.equal(regRes.user.role, 'RESIDENT', 'Default safe role should be RESIDENT');
  });

  it('3. AdminService should accurately aggregate live platform telemetry', async () => {
    const analytics = await AdminService.getDashboardAnalytics();

    assert.ok(analytics.metrics, 'Metrics object must be returned');
    assert.ok(typeof analytics.metrics.totalUsers === 'number');
    assert.ok(typeof analytics.metrics.totalProviders === 'number');
    assert.ok(Array.isArray(analytics.charts.categoryDistribution));
    assert.ok(Array.isArray(analytics.charts.trends));
  });

  it('4. RBAC authorize middleware should forbid non-admin roles', () => {
    const adminGuard = authorize('ADMIN');

    // Simulate resident user
    const reqResident = { user: { id: 'user123', role: 'RESIDENT' } };
    const res = {};
    let errorCaught = null;

    adminGuard(reqResident, res, (err) => {
      errorCaught = err;
    });

    assert.ok(errorCaught, 'Error must be passed to next()');
    assert.equal(errorCaught.statusCode, 403, 'Must return 403 Forbidden');
    assert.ok(errorCaught.message.includes('Access restricted to roles: [ADMIN]'));
  });
});
