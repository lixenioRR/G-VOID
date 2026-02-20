import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.gvoid.game',
    appName: 'G-VOID',
    webDir: 'out',
    server: {
        androidScheme: 'https',
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#050505',
            showSpinner: false,
        },
    },
};

export default config;
