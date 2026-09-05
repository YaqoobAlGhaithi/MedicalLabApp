import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.almnar.app',
  appName: 'AlManar Lab',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
