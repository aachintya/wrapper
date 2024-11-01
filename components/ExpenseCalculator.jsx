import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  TextInput,
  Modal,
  FlatList,ActivityIndicator,
  Alert,Linking,Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import * as Linking from 'expo-linking';
import { COLORS } from '../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { useGlobalContext } from '../components/globalProvider';
import { useNavigation } from '@react-navigation/native';
import { UPI_APPS, PaymentService } from './PaymentService';
import * as IntentLauncher from 'expo-intent-launcher';
// import * as Linking from 'expo-linking';

function openApp(platformSpecificLink) {
  if (Platform.OS === 'android') {
    // For Android, use package names with expo-intent-launcher
    try {
      IntentLauncher.startActivityAsync(IntentLauncher.ACTION_VIEW, {
        packageName: platformSpecificLink.android,
      });
    } catch (error) {
      console.error("Failed to open app on Android:", error);
    }
  } else if (Platform.OS === 'ios') {
    // For iOS, use deep link URLs
    Linking.openURL(platformSpecificLink.ios).catch((err) =>
      console.error("Failed to open app on iOS:", err)
    );
  }
}


const CATEGORIES = {
  EXPENSE: [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Health & Fitness',
    'Travel',
    'Other'
  ],
  INCOME: [
    'Salary',
    'Business',
    'Investments',
    'Freelance',
    'Gift',
    'Other'
  ],
  TRANSFER: [
    'Account Transfer',
    'Investment Transfer',
    'Debt Payment',
    'Other'
  ]
};

const ACCOUNTS = [
  'Cash',
  'Bank Account',
  'Credit Card',
  'Savings',
  'Investment'
];

const PAYMENT_METHODS = [
  { id: 'cash', name: 'Cash' },
  { id: 'upi', name: 'UPI Payment' }
];

const MERCHANT_UPI = "blurofficialchannel@okaxis"; // Replace with your UPI ID

const ExpenseCalculator = ({ onClose, initialData }) => {
  // Track whether we're in edit mode based on initialData presence
  const isEditMode = Boolean(initialData);
  
  const [type, setType] = useState(initialData?.type || 'EXPENSE');
  const [expression, setExpression] = useState('');
  const [note, setNote] = useState(initialData?.note || '');
  const [account, setAccount] = useState(initialData?.account || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUPIAppsModal, setShowUPIAppsModal] = useState(false);
  const [availableUPIApps, setAvailableUPIApps] = useState([]);
  const [paymentPending, setPaymentPending] = useState(false);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [date, setDate] = useState(initialData ? new Date(initialData.date) : new Date());
  const { onSave } = useGlobalContext();
  const navigation = useNavigation();

  useEffect(() => {
    // Only check for UPI apps if we're not in edit mode
    if (!isEditMode) {
      checkInstalledApps();
    }
  }, [isEditMode]);

  const checkInstalledApps = async () => {
    setIsLoadingApps(true);
    try {
      const installedApps = [];
      for (const app of UPI_APPS) {
        const isInstalled = await PaymentService.isAppInstalled(app);
        if (isInstalled) {
          installedApps.push(app);
        }
      }
      setAvailableUPIApps(installedApps);
    } catch (error) {
      console.error('Error checking installed apps:', error);
    } finally {
      setIsLoadingApps(false);
    }
  };

  const handlePayment = (paymentMethod) => {
    setShowPaymentModal(false);
    if (paymentMethod === 'cash') {
      setTimeout(() => {
        saveTransaction();
      }, 100);
    } else if (paymentMethod === 'upi') {
      if (availableUPIApps.length === 0) {
        Alert.alert(
          'No UPI Apps',
          'No UPI payment apps found on your device. Please install a UPI app to continue.',
          [{ text: 'OK' }]
        );
        return;
      }
      setShowUPIAppsModal(true);
    }
  };

  const handleUPIApp = async (app) => {
    try {
      setShowUPIAppsModal(false);
      setPaymentPending(true);

      const result = await PaymentService.handleUPIPayment(
        app,
        amount,
        note || category,
        MERCHANT_UPI
      );

      if (result) {
        Alert.alert(
          'Payment Confirmation',
          'Did you complete the payment successfully?',
          [
            {
              text: 'No',
              onPress: () => {
                setPaymentPending(false);
                setShowPaymentModal(true);
              },
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: () => {
                saveTransaction();
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Error', 'Failed to open payment app');
        setPaymentPending(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Failed to process payment');
      setPaymentPending(false);
    }
  };

  const handleNumber = (num) => {
    if (amount === '0') {
      setAmount(num);
    } else {
      setAmount(amount + num);
    }
  };

  const handleOperator = (operator) => {
    if (amount !== '0') {
      setExpression(amount + operator);
      setAmount('0');
    }
  };

  const calculate = () => {
    if (expression) {
      try {
        const result = eval(expression + amount);
        setAmount(result.toString());
        setExpression('');
      } catch (error) {
        setAmount('0');
        setExpression('');
      }
    }
  };

  const handleClear = () => {
    setAmount('0');
    setExpression('');
  };

  const handleBackspace = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount('0');
    }
  };

  const saveTransaction = () => {
    setShowUPIAppsModal(false);
    setPaymentPending(false);

    const transactionData = {
      id: initialData?.id || Date.now(), // Keep the original ID if editing
      amount: parseFloat(amount),
      type,
      category,
      account,
      note,
      date,
      lastModified: new Date().toISOString(),
      isUpdate: isEditMode // Add flag to indicate if this is an update
    };

    onSave(transactionData);
    onClose();
  };
  const handleSave = () => {
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }


    // If we're editing or it's an income transaction, save directly
    if (isEditMode || type === 'INCOME') {
      saveTransaction();
    } else {
      // Only show payment modal for new expenses
      setShowPaymentModal(true);
    }
  };

  const renderUPIAppsModal = () => (
    <Modal
      visible={showUPIAppsModal}
      animationType="slide"
      transparent={false}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select UPI App</Text>
          <TouchableOpacity onPress={() => {
            setShowUPIAppsModal(false);
            setShowPaymentModal(true);
          }}>
            <Text style={{ color: COLORS.primary }}>Back</Text>
          </TouchableOpacity>
        </View>
        {isLoadingApps ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Checking installed apps...</Text>
          </View>
        ) : (
          <FlatList
            data={availableUPIApps}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.listItem}
                onPress={() => handleUPIApp(item)}
              >
                <Text style={styles.listItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No UPI apps installed</Text>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );

  // Add these new styles
  const additionalStyles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: wp('2%'),
      color: COLORS.text.primary,
      fontSize: wp('4%'),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: wp('4%'),
    },
    emptyText: {
      color: COLORS.text.secondary,
      fontSize: wp('4%'),
    },
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background
    },
    paymentMethod: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: wp('4%'),
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightbackground,
    },
    paymentMethodText: {
      fontSize: wp('4%'),
      color: COLORS.text.primary,
      marginLeft: wp('3%'),
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: wp('4%'),
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightbackground
    },
    headerButton: {
      fontSize: wp('4%'),
      fontWeight: '500'
    },
    cancelButton: {
      color: '#ff6b6b'
    },
    saveButton: {
      color: '#51cf66'
    },
    typeSelector: {
      flexDirection: 'row',
      justifyContent: 'center',
      padding: wp('4%'),
      gap: wp('4%')
    },
    typeButton: {
      padding: wp('2%'),
      paddingHorizontal: wp('4%'),
      borderRadius: wp('4%')
    },
    activeType: {
      backgroundColor: COLORS.primary,
    },
    typeText: {
      color: COLORS.text.primary,
      fontSize: wp('4%')
    },
    activeTypeText: {
      color: COLORS.whiteBg
    },
    inputSection: {
      padding: wp('4%'),
      gap: wp('4%')
    },
    inputField: {
      padding: wp('4%'),
      borderWidth: 1,
      borderColor: COLORS.lightbackground,
      borderRadius: wp('2%'),
      fontSize: wp('4%')
    },
    displaySection: {
      padding: wp('4%'),
      alignItems: 'flex-end',
      backgroundColor: COLORS.lightbackground,
      minHeight: hp('15%')
    },
    expression: {
      fontSize: wp('5%'),
      color: COLORS.text.secondary
    },
    amount: {
      fontSize: wp('8%'),
      color: COLORS.text.primary,
      fontWeight: '500'
    },
    keypad: {
      flex: 1,
      padding: wp('2%')
    },
    keypadRow: {
      flexDirection: 'row',
      flex: 1
    },
    key: {
      flex: 1,
      margin: wp('1%'),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.lightbackground,
      borderRadius: wp('2%')
    },
    operatorKey: {
      backgroundColor: COLORS.primary + '20'
    },
    keyText: {
      fontSize: wp('6%'),
      color: COLORS.text.primary
    },
    modalContainer: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: wp('4%'),
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightbackground,
    },
    modalTitle: {
      fontSize: wp('4.5%'),
      fontWeight: '500',
      color: COLORS.text.primary,
    },
    listItem: {
      padding: wp('4%'),
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightbackground,
    },
    listItemText: {
      fontSize: wp('4%'),
      color: COLORS.text.primary,
    },
    noteInput: {
      color: COLORS.text.primary,
      fontSize: wp('4%'),
      padding: 0,
    },
    ...additionalStyles,

  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.headerButton, styles.cancelButton]}>CANCEL</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.headerButton, styles.saveButton]}>SAVE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.typeSelector}>
        {['INCOME', 'EXPENSE', 'TRANSFER'].map((typeOption) => (
          <TouchableOpacity 
            key={typeOption}
            style={[styles.typeButton, type === typeOption && styles.activeType]}
            onPress={() => setType(typeOption)}
          >
            <Text style={[styles.typeText, type === typeOption && styles.activeTypeText]}>
              {typeOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputSection}>
        <TouchableOpacity 
          style={styles.inputField}
          onPress={() => setShowAccountModal(true)}
        >
          <Text style={{ color: account ? COLORS.text.primary : COLORS.text.secondary }}>
            {account || 'Account'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.inputField}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={{ color: category ? COLORS.text.primary : COLORS.text.secondary }}>
            {category || 'Category'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.inputField}>
          <TextInput
            placeholder="Add notes"
            placeholderTextColor={COLORS.text.secondary}
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
          />
        </View>
      </View>

      <View style={styles.displaySection}>
        {expression && <Text style={styles.expression}>{expression}</Text>}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.amount}>{amount}</Text>
          <TouchableOpacity onPress={handleBackspace} style={{ marginLeft: wp('4%') }}>
            <Ionicons name="backspace-outline" size={wp('6%')} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.keypad}>
        {[
          ['7', '8', '9', '+'],
          ['4', '5', '6', '-'],
          ['1', '2', '3', '×'],
          ['0', '.', '=', '/']
        ].map((row, i) => (
          <View key={i} style={styles.keypadRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.key,
                  ['+', '-', '×', '/', '='].includes(key) && styles.operatorKey
                ]}
                onPress={() => {
                  if (key === '=') {
                    calculate();
                  } else if (['+', '-', '×', '/'].includes(key)) {
                    const operator = key === '×' ? '*' : key;
                    handleOperator(operator);
                  } else {
                    handleNumber(key);
                  }
                }}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Text style={{ color: COLORS.primary }}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={CATEGORIES[type]}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.listItem}
                onPress={() => {
                  setCategory(item);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.listItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Account Selection Modal */}
      <Modal
        visible={showAccountModal}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Account</Text>
            <TouchableOpacity onPress={() => setShowAccountModal(false)}>
              <Text style={{ color: COLORS.primary }}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
              data={ACCOUNTS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.listItem}
                  onPress={() => {
                    setAccount(item);
                    setShowAccountModal(false);
                  }}
                >
                  <Text style={styles.listItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </Modal>
         {/* Payment Method Selection Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Payment Method</Text>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Text style={{ color: COLORS.primary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={PAYMENT_METHODS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.listItem}
                onPress={() => handlePayment(item.id)}
              >
                <Text style={styles.listItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* UPI Apps Selection Modal */}
      {/* <Modal
        visible={showUPIAppsModal}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select UPI App</Text>
            <TouchableOpacity onPress={() => {
              setShowUPIAppsModal(false);
              setShowPaymentModal(true);
            }}>
              <Text style={{ color: COLORS.primary }}>Back</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={availableUPIApps}
            keyExtractor={(item) => item.id || item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.listItem}
                onPress={() => handleUPIApp(item)}
              >
                <Text style={styles.listItemText}>{item.name || item}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal> */}
            {renderUPIAppsModal()}


      {/* Loading Overlay for Payment Processing */}
      {paymentPending && (
        <View style={[StyleSheet.absoluteFill, {
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }]}>
          <View style={{
            backgroundColor: COLORS.background,
            padding: wp('5%'),
            borderRadius: wp('2%'),
            alignItems: 'center'
          }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.modalTitle, { marginTop: wp('2%') }]}>
              Processing Payment
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>

    );
  }
  export default ExpenseCalculator;    