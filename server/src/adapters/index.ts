import { IBackendAdapter } from './backend.interface.js';
import { MockBackendAdapter } from './mockBackend.adapter.js';
import { HttpBackendAdapter } from './httpBackend.adapter.js';
import { config } from '../config/env.config.js';

let adapterInstance: IBackendAdapter | null = null;

export function getBackendAdapter(): IBackendAdapter {
  if (!adapterInstance) {
    if (config.backend.mode === 'http') {
      console.log(`[AI Backend Adapter] Using HttpBackendAdapter (${config.backend.baseUrl})`);
      adapterInstance = new HttpBackendAdapter();
    } else {
      console.log('[AI Backend Adapter] Using MockBackendAdapter (Local Grounded State)');
      adapterInstance = new MockBackendAdapter();
    }
  }
  return adapterInstance;
}

export * from './backend.interface.js';
export * from './mockBackend.adapter.js';
export * from './httpBackend.adapter.js';
