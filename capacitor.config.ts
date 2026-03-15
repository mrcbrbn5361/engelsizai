import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.miracpelinstudios.engelsizai',  // ✅ Paket ID
  appName: 'EngelsizAI',                       // ✅ Uygulama Adı
  webDir: 'out',                               // ✅ Next.js export çıktısı
  bundledWebRuntime: false,
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
