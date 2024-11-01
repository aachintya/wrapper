import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { format, parseISO } from 'date-fns';
import { useGlobalContext } from './globalProvider';

const TransactionRecord = ({ transaction, onEdit }) => {
  const { dispatch } = useGlobalContext();

  // Format date helper function
  const formatDateTime = (dateString) => {
    try {
      if (!dateString) return 'No date';
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return format(date, 'MMM dd, yyyy hh:mm a');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            dispatch({ type: 'DELETE_TRANSACTION', payload: transaction.id });
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onLongPress={handleDelete}
    >
      <View style={styles.header}>
        <Text style={styles.category}>{transaction.category}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            onPress={() => onEdit && onEdit(transaction)}
            style={styles.actionButton}
          >
            <Ionicons name="pencil" size={wp('5%')} color={COLORS.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleDelete}
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={wp('5%')} color={COLORS.text.secondary} />
          </TouchableOpacity>
          <Text
            style={[
              styles.amount,
              { color: transaction.type === 'EXPENSE' ? '#ff6b6b' : '#51cf66' },
            ]}
          >
            ₹{transaction.amount !== null && transaction.amount !== undefined 
              ? transaction.amount.toFixed(2) 
              : '0.00'}
          </Text>
        </View>
      </View>
      <View style={styles.details}>
        <Text style={styles.note}>{transaction.note || 'No note'}</Text>
        <Text style={styles.account}>{transaction.account}</Text>
      </View>
      <Text style={styles.date}>
        {formatDateTime(transaction.date)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: wp('4%'),
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightbackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  category: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amount: {
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  note: {
    fontSize: wp('3.5%'),
    color: COLORS.text.secondary,
  },
  account: {
    fontSize: wp('3.5%'),
    color: COLORS.text.secondary,
  },
  date: {
    fontSize: wp('3.5%'),
    color: COLORS.text.secondary,
    marginTop: hp('0.5%'),
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: wp('2%'),
    marginRight: wp('2%'),
  },
});

export default TransactionRecord;