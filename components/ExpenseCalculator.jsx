import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { useGlobalContext } from '../components/globalProvider';
import { useNavigation } from '@react-navigation/native';
import { UPI_APPS, PaymentService } from './PaymentService';
import * as IntentLauncher from 'expo-intent-launcher';
import DateTimePicker from '@react-native-community/datetimepicker';

// Function to open UPI apps
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

const MAX_DIGITS = 9;
const DECIMAL_PLACES = 2;

const ExpenseCalculator = ({ onClose, initialData }) => {
  // Track whether we're in edit mode based on initialData presence
  const isEditMode = Boolean(initialData);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialData?.date ? new Date(initialData.date) : new Date());
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
  const [isProcessing, setIsProcessing] = useState(false);
  const { onSave,state} = useGlobalContext();
  
  // Transfer-specific states
  const [fromAccount, setFromAccount] = useState(initialData?.fromAccount || '');
  const [toAccount, setToAccount] = useState(initialData?.toAccount || '');
  const [showFromAccountModal, setShowFromAccountModal] = useState(false);
  const [showToAccountModal, setShowToAccountModal] = useState(false);

  const validateAmount = useCallback((value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return false;
    const wholeNumberPart = Math.floor(Math.abs(numValue)).toString();
    return wholeNumberPart.length <= MAX_DIGITS;
  }, []);

  useEffect(() => {
    // Only check for UPI apps if we're not in edit mode
    if (!isEditMode) {
      checkInstalledApps();
    }
  }, [isEditMode]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // const checkInstalledApps = async () => {

  //   setIsLoadingApps(true);
  //   try {
     

  //     const installedApps = [];
  //     for (const app of UPI_APPS) {
  //       const isInstalled = await PaymentService.checkInstalledApps(app);
  //       if (isInstalled) {
  //         installedApps.push(app);
  //       }
  //     }
  //     setAvailableUPIApps(installedApps);
  //   } catch (error) {
  //     console.error('Error checking installed apps:', error);
  //   } finally {
  //     setIsLoadingApps(false);
  //   }
  // };


  const checkInstalledApps = () => {
    setIsLoadingApps(true);
    setAvailableUPIApps(UPI_APPS); // Directly show all UPI apps
    setIsLoadingApps(false);
  };
  // Date change handler
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || selectedDate;
    setShowDatePicker(Platform.OS === 'ios');
    if (currentDate) {
      const newDate = new Date(currentDate);
      // Preserve the time from the existing selectedDate
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
      setSelectedDate(newDate);
    }
  };

  // Time change handler
  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || selectedTime;
    setShowTimePicker(Platform.OS === 'ios');
    if (currentTime) {
      const newDate = new Date(selectedDate);
      newDate.setHours(currentTime.getHours());
      newDate.setMinutes(currentTime.getMinutes());
      setSelectedDate(newDate);
    }
  };

  const handlePayment = (paymentMethod) => {
    setShowPaymentModal(false);
    if (paymentMethod === 'cash') {
      setTimeout(() => {
        saveTransaction();
      }, 100);
    } else if (paymentMethod === 'upi') {
     
      setShowUPIAppsModal(true);
    }
  };

  // const handleUPIApp = async (app) => {
  //   try {
  //     setShowUPIAppsModal(false);  // Close any modal if needed
  //     setPaymentPending(true);  // Set loading state to true (if using)
  
  //     const appSpecificUrl = app.uriSchema;  // Get the URI schema (e.g., 'gpay://')
  
  //     // Open the app directly without checking if it's installed
  //     await Linking.openURL(appSpecificUrl);
  
  //     setPaymentPending(false); 
  //     saveTransaction(); // Reset loading state
  //   } catch (error) {
  //     console.error('Error opening app:', error);
  //     setPaymentPending(false);  // Reset loading state on error
  //   }
  // };


  const handleUPIApp = async (app) => {
    try {
      setShowUPIAppsModal(false); // Close any modal if needed
      setPaymentPending(true);    // Set loading state to true (if using)
  
      if (Platform.OS === 'android') {
        // Android-specific handling with IntentLauncher
        const activity = {
          package: app.package,
          flags: [
            IntentLauncher.FLAG_ACTIVITY_NEW_TASK,
            IntentLauncher.FLAG_ACTIVITY_SINGLE_TOP,
          ],
        };
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', activity);
      } else {
        // iOS-specific handling
        const appSpecificUrl = `${app.uriSchema}://`; // Make sure to append '://' on iOS
        await Linking.openURL(appSpecificUrl);
      }
  
      setPaymentPending(false);
      saveTransaction(); // Reset loading state and proceed to save transaction
    } catch (error) {
      console.error('Error opening app:', error);
      setPaymentPending(false);    // Reset loading state on error
    }
  };
  const handleNumber = useCallback((num) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    setTimeout(() => {
      setAmount(prevAmount => {
        const newAmount = prevAmount === '0' ? num : prevAmount + num;
        
        // Handle decimal places
        if (newAmount.includes('.')) {
          const [whole, decimal] = newAmount.split('.');
          if (decimal && decimal.length > DECIMAL_PLACES) {
            return prevAmount;
          }
        }
        
        // Validate digit count
        const wholeNumber = newAmount.split('.')[0];
        if (wholeNumber.length > MAX_DIGITS) {
          Alert.alert('Invalid Amount', 'Maximum 9 digits allowed');
          return prevAmount;
        }
        
        return newAmount;
      });
      setIsProcessing(false);
    }, 100); // Debounce time for multi-touch handling
  }, [isProcessing]);

  const handleOperator = useCallback((operator) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    setTimeout(() => {
      if (amount !== '0') {
        setExpression(amount + operator);
        setAmount('0');
      }
      setIsProcessing(false);
    }, 100);
  }, [amount, isProcessing]);

  const calculate = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    setTimeout(() => {
      if (expression) {
        try {
          // Handle division by zero
          if (expression.endsWith('/') && parseFloat(amount) === 0) {
            Alert.alert('Invalid Operation', 'Cannot divide by zero');
            handleClear();
            setIsProcessing(false);
            return;
          }

          // Replace multiplication symbol for evaluation
          const evalExpression = expression.replace(/×/g, '*');
          const result = eval(evalExpression + amount);
          
          // Handle invalid results
          if (!isFinite(result)) {
            Alert.alert('Invalid Amount', 'Result is invalid');
            handleClear();
            setIsProcessing(false);
            return;
          }

          // Format result to fixed decimal places
          const formattedResult = parseFloat(result.toFixed(DECIMAL_PLACES)).toString();
          
          // Validate result length
          if (!validateAmount(formattedResult)) {
            Alert.alert('Invalid Amount', 'Result exceeds maximum digits allowed');
            handleClear();
          } else {
            setAmount(formattedResult);
            setExpression('');
          }
        } catch (error) {
          Alert.alert('Error', 'Invalid calculation');
          handleClear();
        }
      }
      setIsProcessing(false);
    }, 100);
  }, [expression, amount, isProcessing, validateAmount]);

  // Enhanced clear function
  const handleClear = useCallback(() => {
    setAmount('0');
    setExpression('');
  }, []);

  // Enhanced backspace handling
  const handleBackspace = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    setTimeout(() => {
      setAmount(prevAmount => {
        if (prevAmount.length > 1) {
          return prevAmount.slice(0, -1);
        }
        return '0';
      });
      setIsProcessing(false);
    }, 100);
  }, [isProcessing]);

  // Save Transaction function
  const saveTransaction = useCallback(() => {
    setShowUPIAppsModal(false);
    setPaymentPending(false);

    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount === 0) {
      Alert.alert('Invalid Amount', 'Amount cannot be zero');
      return;
    }

    if (!validateAmount(amount)) {
      Alert.alert('Invalid Amount', 'Amount is invalid');
      return;
    }

    const transactionData = {
      id: initialData?.id || Date.now(),
      amount: numAmount,
      type,
      category: type === 'TRANSFER' ? 'Transfer' : category,
      account: type === 'TRANSFER' ? fromAccount : account,
      toAccount: type === 'TRANSFER' ? toAccount : undefined,
      note,
      date: selectedDate.toISOString(),
      lastModified: new Date().toISOString(),
      isUpdate: isEditMode,

    };

    onSave(transactionData);
    onClose();
  }, [amount, type, category, account, fromAccount, toAccount, note, selectedDate, initialData, isEditMode, onSave, onClose, validateAmount]);

  const handleSave = () => {
    if (type === 'TRANSFER') {
      if (!fromAccount) {
        Alert.alert("Error", "Please select a source account");
        return;
      }
      if (!toAccount) {
        Alert.alert("Error", "Please select a destination account");
        return;
      }
      if (fromAccount === toAccount) {
        Alert.alert("Error", "Source and destination accounts cannot be the same");
        return;
      }
    } else if (!account) {
      Alert.alert("Error", "Please select an account");
      return;
    }
    
    if (!category && type !== 'TRANSFER') {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (isEditMode || type === 'INCOME' || type === 'TRANSFER') {
      saveTransaction();
    } else {
      setShowPaymentModal(true);
    }
  };

  // Render transfer-specific input fields
  const renderTransferFields = () => (
    <>
      <TouchableOpacity 
        style={styles.inputField}
        onPress={() => setShowFromAccountModal(true)}
      >
        <Text style={{ color: fromAccount ? COLORS.text.primary : COLORS.text.secondary }}>
          {fromAccount || 'From Account'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.inputField}
        onPress={() => setShowToAccountModal(true)}
      >
        <Text style={{ color: toAccount ? COLORS.text.primary : COLORS.text.secondary }}>
          {toAccount || 'To Account'}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderDateTime = () => (
    <View style={dateTimeStyles.dateTimeContainer}>
      <TouchableOpacity 
        style={dateTimeStyles.dateTimeButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons 
          name="calendar-outline" 
          size={wp('5%')} 
          color={COLORS.text.primary}
          style={dateTimeStyles.iconStyle}
        />
        <Text style={dateTimeStyles.dateTimeText}>
          {formatDate(selectedDate)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={dateTimeStyles.dateTimeButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Ionicons 
          name="time-outline" 
          size={wp('5%')} 
          color={COLORS.text.primary}
          style={dateTimeStyles.iconStyle}
        />
        <Text style={dateTimeStyles.dateTimeText}>
          {formatTime(selectedDate)}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderKeypad = () => (
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
                if (isProcessing) return;
                
                if (key === '=') {
                  calculate();
                } else if (['+', '-', '×', '/'].includes(key)) {
                  const operator = key === '×' ? '*' : key;
                  handleOperator(operator);
                } else if (key === '.') {
                  if (!amount.includes('.')) {
                    handleNumber(key);
                  }
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
  );

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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.headerButton, styles.cancelButton]}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.headerButton, styles.saveButton]}>SAVE</Text>
          </TouchableOpacity>
        </View>

        {/* Type Selector */}
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
                  
        {/* Input Section */}
        <View style={styles.inputSection}>
          {type === 'TRANSFER' ? (
            renderTransferFields()
          ) : (
            <>
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
            </>
          )}
          
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

        {/* Date and Time Pickers */}
        {renderDateTime()}

        {/* Display Section */}
        <View style={styles.displaySection}>
          {expression && <Text style={styles.expression}>{expression}</Text>}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.amount}>{amount}</Text>
            <TouchableOpacity onPress={handleBackspace} style={{ marginLeft: wp('4%') }}>
              <Ionicons name="backspace-outline" size={wp('6%')} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Keypad */}
        <View style={styles.keypad}>
          {renderKeypad()}
        </View>

        {/* Date Time Picker Modals */}
        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onDateChange}
          />
        )}

        {showTimePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={onTimeChange}
          />
        )}
        
        {Platform.OS === 'ios' && (showDatePicker || showTimePicker) && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker || showTimePicker}
          >
            <View style={{
              flex: 1,
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
              <View style={{
                backgroundColor: '#FFFFFF',
                padding: wp('4%'),
                borderTopLeftRadius: wp('4%'),
                borderTopRightRadius: wp('4%'),
              }}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: wp('4%'),
                }}>
                  <TouchableOpacity onPress={() => {
                    setShowDatePicker(false);
                    setShowTimePicker(false);
                  }}>
                    <Text style={{ color: COLORS.primary, fontSize: wp('4%') }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    setShowDatePicker(false);
                    setShowTimePicker(false);
                  }}>
                    <Text style={{ color: COLORS.primary, fontSize: wp('4%') }}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode={showDatePicker ? "date" : "time"}
                  display="spinner"
                  onChange={showDatePicker ? onDateChange : onTimeChange}
                  style={{ height: hp('25%') }}
                  textColor="#000000"
                  themeVariant="light"
                />
              </View>
            </View>
          </Modal>
        )}

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

        {/* From Account Selection Modal */}
        <Modal
          visible={showFromAccountModal}
          animationType="slide"
          transparent={false}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Source Account</Text>
              <TouchableOpacity onPress={() => setShowFromAccountModal(false)}>
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
                    setFromAccount(item);
                    setShowFromAccountModal(false);
                  }}
                >
                  <Text style={styles.listItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </Modal>

        {/* To Account Selection Modal */}
        <Modal
          visible={showToAccountModal}
          animationType="slide"
          transparent={false}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Destination Account</Text>
              <TouchableOpacity onPress={() => setShowToAccountModal(false)}>
                <Text style={{ color: COLORS.primary }}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={ACCOUNTS.filter(acc => acc !== fromAccount)}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.listItem}
                  onPress={() => {
                    setToAccount(item);
                    setShowToAccountModal(false);
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
    </TouchableWithoutFeedback>
  );
};

export default ExpenseCalculator;

// Styles
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

const dateTimeStyles = StyleSheet.create({
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: wp('3%'),
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.lightbackground,
    marginBottom: wp('2%'),
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('3%'),
    borderRadius: wp('2%'),
    backgroundColor: COLORS.lightbackground,
    minWidth: wp('40%'), // Set minimum width for consistency
    justifyContent: 'center',
  },
  dateTimeText: {
    color: COLORS.text.primary,
    fontSize: wp('4%'),
    marginLeft: wp('2%'),
    fontWeight: '500',
  },
  iconStyle: {
    marginRight: wp('2%'),
  }
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
    fontSize: wp('4%'),
    justifyContent: 'center'
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
  ...additionalStyles,
});
