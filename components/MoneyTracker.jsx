import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView ,Platform,StatusBar} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from '@react-navigation/native';

const MoneyTracker = () => {
  const navigation = useNavigation();
  const styles = {
    container: {
      flex: 1,
      backgroundColor: '#2f2f2f',
      marginTop: Platform.OS === 'android' ? 25 : 0
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: wp(4)
    },
    menuButton: {
      padding: wp(2)
    },
    searchButton: {
      padding: wp(2)
    },
    title: {
      fontSize: wp(6),
      fontWeight: '500',
      color: '#ffd43b'
    },
    monthNav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: wp(4)
    },
    monthText: {
      fontSize: wp(4.5),
      fontWeight: '500',
      flex: 1,
      textAlign: 'center',
      color: '#fff'
    },
    filterButton: {
      marginLeft: wp(4)
    },
    summary: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: wp(4),
      borderBottomWidth: 1,
      borderBottomColor: '#404040'
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center'
    },
    summaryLabel: {
      fontSize: wp(3),
      color: '#888',
      marginBottom: hp(0.5)
    },
    summaryAmount: {
      fontSize: wp(4),
      fontWeight: '500'
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: wp(8)
    },
    emptyStateText: {
      color: '#666',
      textAlign: 'center',
      marginTop: hp(2),
      fontSize: wp(4)
    },
    addButton: {
      position: 'absolute',
      right: wp(6),
      bottom: hp(10),
      width: wp(14),
      height: wp(14),
      borderRadius: wp(7),
      backgroundColor: '#666',
      justifyContent: 'center',
      alignItems: 'center'
    },
    addButtonText: {
      fontSize: wp(8),
      color: '#fff'
    }
  };

  return (
    <SafeAreaView style={styles.container}>
   <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}  onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={wp(6)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Wrapper</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={wp(6)} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.monthNav}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={wp(6)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.monthText}>October, 2024</Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={wp(6)} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={wp(6)} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>EXPENSE</Text>
          <Text style={[styles.summaryAmount, { color: '#ff6b6b' }]}>₹0.00</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>INCOME</Text>
          <Text style={[styles.summaryAmount, { color: '#51cf66' }]}>₹0.00</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>TOTAL</Text>
          <Text style={[styles.summaryAmount, { color: '#51cf66' }]}>₹0.00</Text>
        </View>
      </View>

      <View style={styles.emptyState}>
        <Ionicons name="document-text-outline" size={wp(12)} color="#666" />
        <Text style={styles.emptyStateText}>
          No record in this month. Tap + to add new expense or income.
        </Text>
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MoneyTracker;
