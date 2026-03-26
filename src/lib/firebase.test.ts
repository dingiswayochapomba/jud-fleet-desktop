import { describe, expect, it } from 'vitest';
import { firebaseApp, firebaseAuth } from './firebase';

describe('firebase bootstrap', () => {
  it('initializes app and auth instances', () => {
    expect(firebaseApp).toBeTruthy();
    expect(firebaseAuth).toBeTruthy();
  });
});
