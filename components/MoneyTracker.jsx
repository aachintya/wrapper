import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, StatusBar, Modal,Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import ExpenseCalculator from './ExpenseCalculator';
import TransactionRecord from './TransactionRecord';
import { useNavigation } from '@react-navigation/native';
import Header from './commonheader';

const MoneyTracker = () => {
  const navigation = useNavigation();
  const [showCalculator, setShowCalculator] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [summaryData, setSummaryData] = useState({
    expense: 0,
    income: 0,
    total: 0
  });

  useEffect(() => {
    const expense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    setSummaryData({
      expense,
      income,
      total: income - expense
    });
  }, [transactions]);

  const handleSaveTransaction = (transactionData) => {
    const newTransaction = {
      id: Date.now(),
      ...transactionData
    };
    setTransactions([newTransaction, ...transactions]);
    setShowCalculator(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,

    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: wp('4%'),
      backgroundColor: COLORS.background
    },
    menuButton: {
      padding: wp('2%')
    },
    searchButton: {
      padding: wp('2%')
    },
    title: {
      fontSize: wp('6%'),
      fontWeight: '500',
      color: COLORS.secondary
    },
    monthNav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: wp('4%'),
      backgroundColor: COLORS.lightbackground
    },
    monthText: {
      fontSize: wp('4.5%'),
      fontWeight: '500',
      flex: 1,
      textAlign: 'center',
      color: COLORS.text.primary
    },
    filterButton: {
      marginLeft: wp('4%')
    },
    summary: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: wp('4%'),
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightbackground,
      backgroundColor: COLORS.background
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center'
    },
    summaryLabel: {
      fontSize: wp('3%'),
      color: COLORS.text.secondary,
      marginBottom: hp('0.5%')
    },
    summaryAmount: {
      fontSize: wp('4%'),
      fontWeight: '500'
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: wp('8%'),
      backgroundColor: COLORS.background
    },
    emptyStateText: {
      color: COLORS.text.secondary,
      textAlign: 'center',
      marginTop: hp('2%'),
      fontSize: wp('4%')
    },
    addButton: {
      position: 'absolute',
      right: wp('7%'),
      bottom: hp('8%'),
      width: wp('14%'),
      height: wp('14%'),
      borderRadius: wp('7%'),
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: COLORS.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
    addButtonText: {
      fontSize: wp('8%'),
      color: COLORS.whiteBg
    },
    transactionList: {
      flex: 1,
      backgroundColor: COLORS.background
    }
  });

  const renderContent = () => {
    if (transactions.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={wp('12%')} color={COLORS.text.secondary} />
          <Text style={styles.emptyStateText}>
            No record in this month. Tap + to add new expense or income.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.transactionList}>
        {transactions.map(transaction => (
          <TransactionRecord key={transaction.id} transaction={transaction} />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
   <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <Header/>

      <View style={styles.monthNav}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>October, 2024</Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>EXPENSE</Text>
          <Text style={[styles.summaryAmount, { color: '#ff6b6b' }]}>
            ₹{summaryData.expense.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>INCOME</Text>
          <Text style={[styles.summaryAmount, { color: '#51cf66' }]}>
            ₹{summaryData.income.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>TOTAL</Text>
          <Text style={[styles.summaryAmount, { 
            color: summaryData.total >= 0 ? '#51cf66' : '#ff6b6b' 
          }]}>
            ₹{summaryData.total.toFixed(2)}
          </Text>
        </View>
      </View>

      {renderContent()}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowCalculator(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={showCalculator}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCalculator(false)}
      >
        <ExpenseCalculator
          onClose={() => setShowCalculator(false)}
          onSave={handleSaveTransaction}
        />
      </Modal>
    </SafeAreaView>
  );
};

export default MoneyTracker;
