import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.miracpelinstudios.engelsizai',
  appName: 'EngelsizAI',
  webDir: 'dist',        // ✅ Vite için 'dist' (Next.js için 'out')
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'engelsizai-release.jks',
      keystoreAlias: 'engelsizai-key'
    }
  }
};

export default config;
