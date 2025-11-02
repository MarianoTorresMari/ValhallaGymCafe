import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Mock de window.storage para desarrollo local
if (typeof window !== 'undefined' && !window.storage) {
  const storageData = new Map();
  
  window.storage = {
    async get(key, shared = false) {
      console.log('📖 Storage GET:', key, 'shared:', shared);
      const value = storageData.get(`${shared ? 'shared:' : 'local:'}${key}`);
      if (value === undefined) {
        throw new Error(`Key ${key} not found`);
      }
      return { key, value, shared };
    },
    
    async set(key, value, shared = false) {
      console.log('💾 Storage SET:', key, 'shared:', shared);
      storageData.set(`${shared ? 'shared:' : 'local:'}${key}`, value);
      return { key, value, shared };
    },
    
    async delete(key, shared = false) {
      console.log('🗑️ Storage DELETE:', key, 'shared:', shared);
      storageData.delete(`${shared ? 'shared:' : 'local:'}${key}`);
      return { key, deleted: true, shared };
    },
    
    async list(prefix = '', shared = false) {
      console.log('📋 Storage LIST:', prefix, 'shared:', shared);
      const keys = [];
      const searchPrefix = `${shared ? 'shared:' : 'local:'}${prefix}`;
      
      for (const [key] of storageData) {
        if (key.startsWith(searchPrefix)) {
          keys.push(key.replace(/^(shared:|local:)/, ''));
        }
      }
      
      return { keys, prefix, shared };
    }
  };
  
  console.log('✅ Mock de window.storage inicializado para desarrollo local');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)