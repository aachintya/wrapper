import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  TextInput,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';

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
const ExpenseCalculator = ({ onClose, onSave }) => {
    const [amount, setAmount] = useState('0');
    const [type, setType] = useState('EXPENSE');
    const [expression, setExpression] = useState('');
    const [note, setNote] = useState('');
    const [account, setAccount] = useState('Cash');
    const [category, setCategory] = useState('');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(false);
  
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
  
    const handleSave = () => {
      if (!category) {
        alert('Please select a category');
        return;
      }
      
      onSave({
        amount: parseFloat(amount),
        type,
        category,
        account,
        note,
        date: new Date()
      });
    };
  
   
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background
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
    });
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.headerButton, styles.cancelButton]}>CANCEL</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onSave(parseFloat(amount), type)}>
          <Text style={[styles.headerButton, styles.saveButton]}>SAVE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.typeSelector}>
        <TouchableOpacity 
          style={[styles.typeButton, type === 'INCOME' && styles.activeType]}
          onPress={() => setType('INCOME')}
        >
          <Text style={[styles.typeText, type === 'INCOME' && styles.activeTypeText]}>INCOME</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.typeButton, type === 'EXPENSE' && styles.activeType]}
          onPress={() => setType('EXPENSE')}
        >
          <Text style={[styles.typeText, type === 'EXPENSE' && styles.activeTypeText]}>EXPENSE</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.typeButton, type === 'TRANSFER' && styles.activeType]}
          onPress={() => setType('TRANSFER')}
        >
          <Text style={[styles.typeText, type === 'TRANSFER' && styles.activeTypeText]}>TRANSFER</Text>
        </TouchableOpacity>
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
        <Text style={styles.amount}>{amount}</Text>
      </View>

      <View style={styles.keypad}>
        {[
          ['7', '8', '9', '+'],
          ['4', '5', '6', '-'],
          ['1', '2', '3', '×'],
          ['0', '.', '=', '÷']
        ].map((row, i) => (
          <View key={i} style={styles.keypadRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.key,
                  ['+', '-', '×', '÷', '='].includes(key) && styles.operatorKey
                ]}
                onPress={() => {
                  if (key === '=') {
                    calculate();
                  } else if (['+', '-', '×', '÷'].includes(key)) {
                    const operator = key === '×' ? '*' : key === '÷' ? '/' : key;
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
      </View>
    </SafeAreaView>
  );
};

export default ExpenseCalculator;