import { describe, expect, it } from 'vitest';
import { isFirebaseConfigComplete } from './firebase';

describe('Firebase web configuration', () => {
  it('requires all authentication values and rejects example placeholders', () => {
    expect(isFirebaseConfigComplete({
      apiKey: 'web-api-key',
      authDomain: 'atomika.firebaseapp.com',
      projectId: 'atomika',
      appId: 'web-app-id',
    })).toBe(true);

    expect(isFirebaseConfigComplete({
      apiKey: 'your-firebase-web-api-key',
      authDomain: 'your-project.firebaseapp.com',
      projectId: 'your-project-id',
      appId: 'your-firebase-app-id',
    })).toBe(false);

    expect(isFirebaseConfigComplete({
      apiKey: 'web-api-key',
      authDomain: 'atomika.firebaseapp.com',
      projectId: 'atomika',
    })).toBe(false);
  });
});
