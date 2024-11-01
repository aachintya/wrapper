import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Modal } from 'react-native';
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
import { useGlobalContext } from './globalProvider';
import { ScrollView } from 'react-native-gesture-handler';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const MoneyTracker = () => {
  const navigation = useNavigation();
  const { state, dispatch } = useGlobalContext();
  const [showCalculator, setShowCalculator] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowCalculator(true);
  };
  const handleSaveTransaction = (transactionData) => {
    if (editingTransaction) {
      dispatch({
        type: 'EDIT_TRANSACTION',
        payload: { 
          id: editingTransaction.id, 
          ...transactionData }
      });
      setEditingTransaction(null);
    } else {
      const newTransaction = {
        id: Date.now(),
        ...transactionData
      };
      dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
    }
    setShowCalculator(false);
  };
  // Filter transactions for current month
  const currentMonthTransactions = state.transactions.filter(transaction => {
    const transactionDate = parseISO(transaction.date);
    const monthStart = startOfMonth(parseISO(state.currentMonth));
    const monthEnd = endOfMonth(parseISO(state.currentMonth));
    
    return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
  });

  // Calculate summary for current month
  const currentMonthSummary = {
    expense: currentMonthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0),
    income: currentMonthTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
  };
  currentMonthSummary.total = currentMonthSummary.income - currentMonthSummary.expense;

  const handlePreviousMonth = () => {
    dispatch({ type: 'PREVIOUS_MONTH' });
  };

  const handleNextMonth = () => {
    dispatch({ type: 'NEXT_MONTH' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Header />

      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={handlePreviousMonth}>
          <Ionicons name="chevron-back" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {format(parseISO(state.currentMonth), 'MMMM, yyyy')}
        </Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <Ionicons name="chevron-forward" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary Section */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>EXPENSE</Text>
          <Text style={[styles.summaryAmount, { color: '#ff6b6b' }]}>
            ₹{currentMonthSummary.expense.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>INCOME</Text>
          <Text style={[styles.summaryAmount, { color: '#51cf66' }]}>
            ₹{currentMonthSummary.income.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>TOTAL</Text>
          <Text style={[styles.summaryAmount, { color: currentMonthSummary.total >= 0 ? '#51cf66' : '#ff6b6b' }]}>
            ₹{currentMonthSummary.total.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Transaction List */}
      <ScrollView style={styles.transactionList}>
        {currentMonthTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={wp('12%')} color={COLORS.text.secondary} />
            <Text style={styles.emptyStateText}>
              No record in this month. Tap + to add new expense or income.
            </Text>
          </View>
        ) :  currentMonthTransactions.map(transaction => (
          <TransactionRecord 
            key={transaction.id} 
            transaction={transaction} 
            onEdit={handleEdit}  // Make sure to pass the handleEdit function here
          />
        )
        )}
      </ScrollView>

      {/* Add Transaction Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowCalculator(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Calculator Modal */}
      <Modal
    visible={showCalculator}
    animationType="slide"
    presentationStyle="pageSheet"
    onRequestClose={() => {
      setShowCalculator(false);
      setEditingTransaction(null);
    }}
  >
    <ExpenseCalculator
      onClose={() => {
        setShowCalculator(false);
        setEditingTransaction(null);
      }}
      onSave={handleSaveTransaction}
      initialData={editingTransaction}
    />
  </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: COLORS.lightbackground,
  },
  monthText: {
    fontSize: wp('4.5%'),
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
    color: COLORS.text.primary,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightbackground,
    backgroundColor: COLORS.background,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: wp('3%'),
    color: COLORS.text.secondary,
    marginBottom: hp('0.5%'),
  },
  summaryAmount: {
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  transactionList: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('8%'),
    backgroundColor: COLORS.background,
    minHeight: hp('50%'),
  },
  emptyStateText: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: hp('2%'),
    fontSize: wp('4%'),
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  addButtonText: {
    fontSize: wp('8%'),
    color: COLORS.whiteBg,
  },
});

export default MoneyTracker;