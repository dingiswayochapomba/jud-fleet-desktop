import { describe, expect, it } from 'vitest';
import { firebaseApp, firebaseAuth } from './firebase';
import { buildActivityLogPayload, buildDriverPayload, buildUserProfilePayload } from './firebaseQueries';

describe('firebase bootstrap', () => {
  it('initializes app and auth instances', () => {
    expect(firebaseApp).toBeTruthy();
    expect(firebaseAuth).toBeTruthy();
  });
});

describe('buildUserProfilePayload', () => {
  it('normalizes form values into a Firestore-safe user payload', () => {
    const payload = buildUserProfilePayload({
      email: 'admin@example.com',
      name: 'System Admin',
      role: 'admin',
      status: 'active',
      position: 'Administrator',
      jurisdiction: 'National',
      password: 'Secret123!',
    }, 'demo-uid');

    expect(payload.email).toBe('admin@example.com');
    expect(payload.name).toBe('System Admin');
    expect(payload.role).toBe('system_admin');
    expect(payload.status).toBe('active');
    expect(payload.position).toBe('Administrator');
    expect(payload.jurisdiction).toBe('National');
    expect(payload.firebase_uid).toBe('demo-uid');
    expect(payload.auth_provider).toBe('firebase');
    expect(payload.created_at).toBeTruthy();
    expect(payload.password).toBeUndefined();
  });
});

describe('buildActivityLogPayload', () => {
  it('creates a normalized activity log payload for audit tracking', () => {
    const payload = buildActivityLogPayload({
      actor_id: 'demo-uid',
      actor_email: 'ADMIN@EXAMPLE.COM',
      actor_name: 'System Admin',
      action: 'login',
      details: 'User signed in successfully',
      category: 'authentication',
      severity: 'info',
      target_user_email: 'driver@example.com',
      metadata: { source: 'web' },
    });

    expect(payload.actor_id).toBe('demo-uid');
    expect(payload.actor_email).toBe('admin@example.com');
    expect(payload.action).toBe('login');
    expect(payload.category).toBe('authentication');
    expect(payload.severity).toBe('info');
    expect(payload.target_user_email).toBe('driver@example.com');
    expect(payload.metadata).toEqual({ source: 'web' });
    expect(payload.created_at).toBeTruthy();
    expect(payload.timestamp).toBe(payload.created_at);
  });
});

describe('buildDriverPayload', () => {
  it('preserves the new driver fields for Firestore persistence', () => {
    const payload = buildDriverPayload({
      name: 'Jane Banda',
      license_number: 'DL-001',
      phone: '+265991234567',
      license_expiry: '2026-12-31',
      status: 'active',
      date_of_birth: '1990-04-12',
      date_of_appointment: '2024-01-15',
      license_class: 'B',
    });

    expect(payload.name).toBe('Jane Banda');
    expect(payload.license_number).toBe('DL-001');
    expect(payload.phone).toBe('+265991234567');
    expect(payload.date_of_birth).toBe('1990-04-12');
    expect(payload.date_of_appointment).toBe('2024-01-15');
    expect(payload.license_class).toBe('B');
    expect(payload.created_at).toBeTruthy();
  });
});
