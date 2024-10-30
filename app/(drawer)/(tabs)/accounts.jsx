import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

const AccountsScreen = () => {
  const navigation = useNavigation();
  
  const accounts = [
    {
      id: 1,
      type: 'Card',
      balance: 0.00,
      icon: 'card-outline'
    },
    {
      id: 2,
      type: 'Cash',
      balance: 0.00,
      icon: 'cash-outline'
    },
    {
      id: 3,
      type: 'Savings',
      balance: 0.00,
      icon: 'wallet-outline'
    }
  ];

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const renderAccountCard = (account) => (
    <TouchableOpacity
      key={account.id}
      style={styles.accountCard}
    >
      <View style={styles.accountInfo}>
        <View style={styles.accountIconContainer}>
          <Ionicons name={account.icon} size={wp('6%')} color={COLORS.text.primary} />
        </View>
        <View style={styles.accountDetails}>
          <Text style={styles.accountType}>{account.type}</Text>
          <Text style={[
            styles.accountBalance,
            { color: account.balance >= 0 ? '#51cf66' : '#ff6b6b' }
          ]}>
            ₹{account.balance.toFixed(2)}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.accountMenu}>
        <Ionicons name="ellipsis-horizontal" size={wp('6%')} color={COLORS.text.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Image source={require('../../../assets/images/logo.png')} style={styles.logo} resizeMode='contain'/>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.totalBalance}>
          <Text style={styles.totalBalanceLabel}>All Accounts</Text>
          <Text style={[
            styles.totalBalanceAmount,
            { color: totalBalance >= 0 ? '#51cf66' : '#ff6b6b' }
          ]}>
            ₹{totalBalance.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>EXPENSE SO FAR</Text>
            <Text style={[styles.summaryAmount, { color: '#ff6b6b' }]}>
              ₹000.00
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>INCOME SO FAR</Text>
            <Text style={[styles.summaryAmount, { color: '#51cf66' }]}>
              ₹0.00
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Accounts</Text>
        
        <View style={styles.accountsList}>
          {accounts.map(renderAccountCard)}
          <TouchableOpacity style={styles.addAccountButton}>
            <Ionicons name="add-circle-outline" size={wp('6%')} color={COLORS.text.primary} />
            <Text style={styles.addAccountText}>ADD NEW ACCOUNT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      
      {/*man hoga to add kr denge */}
      {/* <TouchableOpacity style={styles.addButton} onPress={()=>router.push()}>
        <Text style={styles.addButtonText}>+</Text>
      // </TouchableOpacity>  */} 
 
    </SafeAreaView>
  );
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
  logo: {
    width: wp('20%'),
    height: wp('8%')
  },
  menuButton: {
    padding: wp('2%')
  },
  searchButton: {
    padding: wp('2%')
  },
  content: {
    flex: 1,
  },
  totalBalance: {
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: COLORS.background
  },
  totalBalanceLabel: {
    fontSize: wp('4%'),
    color: COLORS.text.primary,
    marginBottom: hp('1%')
  },
  totalBalanceAmount: {
    fontSize: wp('7%'),
    fontWeight: '600'
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: wp('4%'),
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightbackground
  },
  summaryItem: {
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
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: '500',
    color: COLORS.text.primary,
    padding: wp('4%'),
    paddingBottom: wp('2%')
  },
  accountsList: {
    padding: wp('4%')
  },
  accountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: COLORS.lightbackground,
    borderRadius: wp('3%'),
    marginBottom: wp('3%')
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  accountIconContainer: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%')
  },
  accountDetails: {
    justifyContent: 'center'
  },
  accountType: {
    fontSize: wp('4.5%'),
    color: COLORS.text.primary,
    fontWeight: '500',
    marginBottom: hp('0.5%')
  },
  accountBalance: {
    fontSize: wp('4%'),
    fontWeight: '500'
  },
  accountMenu: {
    padding: wp('2%')
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp('4%'),
    backgroundColor: COLORS.lightbackground,
    borderRadius: wp('3%'),
    marginTop: wp('2%')
  },
  addAccountText: {
    color: COLORS.text.primary,
    fontSize: wp('4%'),
    fontWeight: '500',
    marginLeft: wp('2%')
  },
 
  addButton: {
    position: 'absolute',
    right: wp('7%'),
    bottom: hp('3%'),
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
  }
});

export default AccountsScreen;