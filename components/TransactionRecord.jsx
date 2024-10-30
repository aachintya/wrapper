import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';

const TransactionRecord = ({ transaction }) => {
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
    amount: {
      fontSize: wp('4%'),
      fontWeight: '500',
    },
    details: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    note: {
      fontSize: wp('3.5%'),
      color: COLORS.text.secondary,
      flex: 1,
    },
    account: {
      fontSize: wp('3.5%'),
      color: COLORS.text.secondary,
    },
    date: {
      fontSize: wp('3.5%'),
      color: COLORS.text.secondary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.category}>{transaction.category}</Text>
        <Text 
          style={[
            styles.amount,
            { color: transaction.type === 'EXPENSE' ? '#ff6b6b' : '#51cf66' }
          ]}
        >
        ₹{transaction.amount ? transaction.amount.toFixed(2) : '0.00'}
         </Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.note} numberOfLines={1}>
          {transaction.note || 'No note'}
        </Text>
        <Text style={styles.account}>{transaction.account}</Text>
      </View>
      <Text style={styles.date}>
        {new Date(transaction.date).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit'
        })}
      </Text>
    </View>
  );
};

export default TransactionRecord;