import * as Linking from 'expo-linking';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';

export const UPI_APPS = [
  {
    id: 'gpay',
    name: 'Google Pay',
    package: 'com.google.android.apps.nbu.paisa.user',
    uriSchema: 'gpay://',
    iosBundleId: 'com.google.GooglePay'
  },
  {
    id: 'paytm',
    name: 'Paytm',
    package: 'net.one97.paytm',
    uriSchema: 'paytm://',
    iosBundleId: 'net.one97.paytm'
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    package: 'com.phonepe.app',
    uriSchema: 'phonepe://',
    iosBundleId: 'com.phonepe.PhonePe'
  },
  {
    id: 'bhim',
    name: 'BHIM',
    package: 'in.org.npci.upiapp',
    uriSchema: 'bhim://',
    iosBundleId: 'in.org.npci.upiapp'
  }
];

export const PaymentService = {
  createUPILink: (amount, note, merchantUPI) => {
    const transactionNote = note || 'Payment';
    // Remove any commas from amount and ensure it's a valid number
    const cleanAmount = amount.toString().replace(/,/g, '');
    
    if (Platform.OS === 'ios') {
      // iOS requires a different format for UPI URLs
      const baseURL = `upi://pay`;
      const params = new URLSearchParams({
        pa: merchantUPI,
        pn: 'Merchant',
        tn: transactionNote,
        am: cleanAmount,
        cu: 'INR',
        mode: '04' // UPI payment mode
      });
      return `${baseURL}?${params.toString()}`;
    } else {
      // Android format
      const baseURL = 'upi://pay';
      const params = new URLSearchParams({
        pa: merchantUPI,
        pn: 'Merchant',
        tn: transactionNote,
        am: cleanAmount,
        cu: 'INR'
      });
      return `${baseURL}?${params.toString()}`;
    }
  },

  handleUPIPayment: async (app, amount, note, merchantUPI) => {
    try {
      const upiUrl = PaymentService.createUPILink(amount, note, merchantUPI);
      
      if (Platform.OS === 'android') {
        // For Android, use Intent Launcher with proper activity flags
        const activity = {
          package: app.package,
          data: upiUrl,
          flags: [
            IntentLauncher.FLAG_ACTIVITY_NEW_TASK,
            IntentLauncher.FLAG_ACTIVITY_SINGLE_TOP
          ]
        };
        
        return await IntentLauncher.startActivityAsync(
          'android.intent.action.VIEW', 
          activity
        );
      } else {
        // For iOS, try specific app URI first, then fallback to universal UPI link
        try {
          const appSpecificUrl = `${app.uriSchema}${upiUrl.substring(4)}`; // Remove 'upi:' prefix
          const canOpenApp = await Linking.canOpenURL(appSpecificUrl);
          
          if (canOpenApp) {
            await Linking.openURL(appSpecificUrl);
            return true;
          }
          
          // Fallback to universal UPI URL
          const canOpenUPI = await Linking.canOpenURL(upiUrl);
          if (canOpenUPI) {
            await Linking.openURL(upiUrl);
            return true;
          }
        } catch (error) {
          console.error('iOS linking error:', error);
        }
        return false;
      }
    } catch (error) {
      console.error('Payment error:', error);
      return false;
    }
  },

  isAppInstalled: async (app) => {
    try {
      if (Platform.OS === 'android') {
        try {
          const result = await IntentLauncher.getApplicationInfo(app.package);
          return !!result;
        } catch {
          return false;
        }
      } else {
        // For iOS, check if the app's URL scheme can be opened
        const testUrl = `${app.uriSchema}://`;
        const canOpen = await Linking.canOpenURL(testUrl);
        return canOpen;
      }
    } catch (error) {
      console.error('Error checking app installation:', error);
      return false;
    }
  }
};