import '@testing-library/jest-dom';

declare const jest: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mock: (moduleName: string, factory?: () => any) => void;
};
declare const beforeAll: (fn: () => void) => void;
declare const afterAll: (fn: () => void) => void;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null as unknown,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
type IntersectionObserverCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void;

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(public callback: IntersectionObserverCallback) {}

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock next/image
jest.mock('next/image', () => {
  const mockReact = require('react');
  return {
    __esModule: true,
    default: function MockImage(props: Record<string, unknown>) {
      return mockReact.createElement('img', props);
    },
  };
});

// Mock next-auth
jest.mock('next-auth/react', () => {
  return {
    useSession: () => ({
      data: null as unknown,
      status: 'unauthenticated',
    }),
    SessionProvider: ({ children }: { children: unknown }) => children,
  };
});

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
