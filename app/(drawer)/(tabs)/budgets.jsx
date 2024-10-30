import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Header from '../../../components/commonheader';

const BudgetsScreen = () => {
  const [budgets, setBudgets] = useState([
    { id: 'food', title: 'Food & Grocery', icon: 'shopping-basket', limit: 0, spent: 0.00, budgeted: false },
    { id: 'bills', title: 'Bills', icon: 'file-invoice-dollar', limit: 0, spent: 0.00, budgeted: false },
    { id: 'car', title: 'Car', icon: 'car', limit: 0, spent: 0.00, budgeted: false },
    { id: 'clothing', title: 'Clothing', icon: 'tshirt', limit: 0, spent: 0.00, budgeted: false },
    { id: 'education', title: 'Education', icon: 'graduation-cap', limit: 0, spent: 0.00, budgeted: false },
  ]);

  const [selectedCategory, setSelectedCategory] = useState(budgets[0]); // Start with 'Baby' category

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const renderBudgetItem = (budget) => (
    <TouchableOpacity key={budget.id} onPress={() => handleCategorySelect(budget)} style={styles.budgetItem}>
      <View style={styles.budgetInfo}>
        <FontAwesome5 name={budget.icon} size={wp('6%')} color={COLORS.text.primary} />
        <Text style={styles.budgetTitle}>{budget.title}</Text>
      </View>
      {budget.budgeted ? (
        <View style={styles.budgetDetails}>
          <Text style={styles.budgetLimit}>Limit: ₹{budget.limit.toFixed(2)}</Text>
          <Text style={styles.budgetSpent}>Spent: ₹{budget.spent.toFixed(2)}</Text>
          <Text style={styles.budgetRemaining}>Remaining: ₹{(budget.limit - budget.spent).toFixed(2)}</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.setBudgetButton}>
          <Text style={styles.setBudgetText}>SET BUDGET</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL BUDGET</Text>
            <Text style={styles.summaryValue}>₹{budgets.reduce((total, budget) => total + budget.limit, 0).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL SPENT</Text>
            <Text style={[styles.summaryValue, { color: '#ff6b6b' }]}>₹{budgets.reduce((total, budget) => total + budget.spent, 0).toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Budgeted categories: Oct, 2024</Text>
        <View style={styles.budgetsList}>
          {budgets.map(renderBudgetItem)}
        </View>

        {selectedCategory && (
          <View style={styles.selectedCategoryDetails}>
            <Text style={styles.selectedCategoryTitle}>Details for {selectedCategory.title}:</Text>
            <Text style={styles.selectedCategoryText}>Limit: ₹{selectedCategory.limit.toFixed(2)}</Text>
            <Text style={styles.selectedCategoryText}>Spent: ₹{selectedCategory.spent.toFixed(2)}</Text>
            <Text style={styles.selectedCategoryText}>Remaining: ₹{(selectedCategory.limit - selectedCategory.spent).toFixed(2)}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
 
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: wp('4%'),
    backgroundColor: COLORS.lightbackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.text.secondary,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: wp('4%'),
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: wp('5%'),
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: '500',
    color: COLORS.text.primary,
    padding: wp('4%'),
    paddingBottom: wp('2%')
  },
  budgetsList: {
    paddingHorizontal: wp('4%')
  },

  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  budgetTitle: {
    fontSize: wp('4.5%'),
    color: COLORS.text.primary,
    fontWeight: '500',
    marginLeft: wp('3%')
  },
  budgetDetails: {
    flex: 1,
    marginLeft: wp('5%')
  },
  budgetLimit: {
    fontSize: wp('4%'),
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  budgetSpent: {
    fontSize: wp('4%'),
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  budgetRemaining: {
    fontSize: wp('4%'),
    color: '#51cf66',
    fontWeight: '500',
  },
  setBudgetButton: {
    paddingVertical: wp('1%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: COLORS.lightbackground,
    borderRadius: wp('3%'),
    borderWidth: 1,
    borderColor: COLORS.text.primary
  },
  setBudgetText: {
    color: COLORS.text.primary,
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  selectedCategoryDetails: {
    padding: wp('4%'),
    backgroundColor: COLORS.lightbackground,
    borderRadius: wp('3%'),
    marginTop: wp('5%'),
    marginBottom: wp('5%')
  },
  budgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: COLORS.lightbackground,
    borderRadius: wp('3%'),
    marginBottom: wp('3%')
  },
  selectedCategoryTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: wp('2%')
  },
  selectedCategoryText: {
    fontSize: wp('4%'),
    color: COLORS.text.primary,
    marginBottom: wp('1%')
  }
});

export default BudgetsScreen;
