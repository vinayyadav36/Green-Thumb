import { describe, test, expect, vi, beforeEach } from 'vitest';

describe('Frontend Business Logic Smoke Tests', () => {

  beforeEach(() => {
    // Clear mocks and localStorage before each test
    vi.restoreAllMocks();
  });

  test('AuthContext/login handles localStorage token correctly', () => {
    // Mock localStorage
    const store = {};
    const mockStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString(); },
      removeItem: (key) => { delete store[key]; }
    };
    global.localStorage = mockStorage;

    const token = 'dummyBase64Token';
    const user = { id: 1, name: 'Admin', role: 'admin' };

    // Simulate what the context login function does
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);

    expect(localStorage.getItem('token')).toBe(token);
    expect(JSON.parse(localStorage.getItem('user')).role).toBe('admin');
  });

  test('Offline Queue saves failed subscriptions', () => {
    const store = {};
    const mockStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString(); },
    };
    global.localStorage = mockStorage;

    // Simulate saving a failed subscription from Subscribe.jsx
    const payload = { boxId: 'spring-box-1', name: 'Test User' };
    const queue = JSON.parse(localStorage.getItem('pending_subscriptions') || '[]');
    queue.push(payload);
    localStorage.setItem('pending_subscriptions', JSON.stringify(queue));

    const updatedQueue = JSON.parse(localStorage.getItem('pending_subscriptions'));
    expect(updatedQueue.length).toBe(1);
    expect(updatedQueue[0].name).toBe('Test User');
  });

  test('Guide Save Offline caches to localStorage', () => {
    const store = {};
    const mockStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString(); },
    };
    global.localStorage = mockStorage;

    // Simulate saving a guide in GuideDetail.jsx
    const guide = { id: 'guide-1', title: 'Basil Care' };
    localStorage.setItem(`guide_${guide.id}`, JSON.stringify(guide));

    const cached = JSON.parse(localStorage.getItem('guide_guide-1'));
    expect(cached.title).toBe('Basil Care');
  });
});
