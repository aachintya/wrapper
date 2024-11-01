import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Header from '../../../components/commonheader';
import { useGlobalContext } from '../../../components/globalProvider';
import { getAIRecommendations } from '../../../utils/aiService';

const Analysis = () => {
  const { state } = useGlobalContext();
  //console.log("Transactions data:", state.transactions);
  const { summary, transactions } = state;
  const [ recommendations, setRecommendations ] = useState([]);
  const [ error, setError ] = useState(null);
  const [ footHeight, setFootHeight ] = useState(hp('6%'));
  const [ isFooterExpanded, setIsFooterExpanded ] = useState(false);
  const footerAnimatedValue = useRef(new Animated.Value(hp('6%'))).current;

  // fetch AI recommendations based on summary and transaction
  useEffect(() => {
    const fetchRecommendations = async () => {
      const response = await getAIRecommendations(summary, transactions);
      if (Array.isArray(response)) {
        setRecommendations(response);
      } else {
        setRecommendations([response]);
      }
    };
    fetchRecommendations();
  }, [summary, transactions]);
  
  const handleFooterPress = () => {
    Animated.timing(footerAnimatedValue, {
      toValue: isFooterExpanded ? hp('6%') : hp('50%'),
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsFooterExpanded(!isFooterExpanded);
  };

  const screenWidth = Dimensions.get('window').width;

  // Get last 5 months including current month
  const getLast5Months = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.unshift({
        key: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        month: date.getMonth()
      });
    }
    return months;
  };

  // Process transaction data for charts
  const processedData = useMemo(() => {
   // console.log("Processed Data:", processedData);
    const last5Months = getLast5Months();
    
    // Initialize monthly data with 0 values for all months
    const monthlyData = {};
    last5Months.forEach(({ key, year, month }) => {
      monthlyData[key] = {
        expenses: 0,
        income: 0,
        key,
        year,
        month
      };
    });

    // Group transactions by month
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      const transactionYear = date.getFullYear();
      const transactionMonth = date.getMonth();

      // Check if transaction belongs to last 5 months
      const isRelevantMonth = last5Months.some(
        m => m.key === monthKey && m.year === transactionYear && m.month === transactionMonth
      );

      if (isRelevantMonth) {
        if (transaction.type === 'EXPENSE') {
          monthlyData[monthKey].expenses += transaction.amount;
        } else {
          monthlyData[monthKey].income += transaction.amount;
        }
      }
    });

    // Group by category (using only last 5 months of data)
    const categoryData = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      const transactionYear = date.getFullYear();
      const transactionMonth = date.getMonth();

      const isRelevantMonth = last5Months.some(
        m => m.key === monthKey && m.year === transactionYear && m.month === transactionMonth
      );

      if (isRelevantMonth && transaction.type === 'EXPENSE') {
        if (!categoryData[transaction.category]) {
          categoryData[transaction.category] = 0;
        }
        categoryData[transaction.category] += transaction.amount;
      }
    });

    return {
      monthly: monthlyData,
      categories: categoryData,
      monthLabels: last5Months.map(m => m.key)
    };
  }, [transactions]);

  // Generate recommendations based on transaction data
  const generateRecommendations = useMemo(() => {
    console.log("Generated Recommendations:", generateRecommendations);
    const recommendations = [];
    const last5Months = getLast5Months();
    
    // Filter transactions for last 5 months
    const recentTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return last5Months.some(
        m => m.year === date.getFullYear() && m.month === date.getMonth()
      );
    });

    // Calculate recent metrics
    const totalExpenses = recentTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = recentTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome * 100 : 0;

    if (savingsRate < 20) {
      recommendations.push({
        title: 'Increase Savings',
        description: `Your savings rate over the last 5 months is ${savingsRate.toFixed(1)}%. Consider setting a goal to save at least 20% of your income.`,
        buttonText: 'Set Savings Goal',
      });
    }

    // Analyze expense categories
    const categoryTotals = {};
    recentTransactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const highestCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];

    if (highestCategory) {
      const categoryPercentage = (highestCategory[1] / totalExpenses) * 100;
      recommendations.push({
        title: `High ${highestCategory[0]} Spending`,
        description: `${highestCategory[0]} represents ${categoryPercentage.toFixed(1)}% of your total expenses (₹${highestCategory[1].toFixed(2)}) in the last 5 months. Consider setting a budget for this category.`,
        buttonText: 'Set Budget',
      });
    }

    // Analyze month-over-month changes
    const monthlyTotals = Object.values(processedData.monthly);
    if (monthlyTotals.length >= 2) {
      const currentMonth = monthlyTotals[monthlyTotals.length - 1];
      const previousMonth = monthlyTotals[monthlyTotals.length - 2];
      
      const expenseChange = ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100;
      
      if (expenseChange > 20) {
        recommendations.push({
          title: 'Spending Increase Alert',
          description: `Your expenses have increased by ${expenseChange.toFixed(1)}% compared to last month. Review your recent transactions to identify areas for potential savings.`,
          buttonText: 'Review Transactions',
        });
      }
    }

    return recommendations;
  }, [transactions, processedData]);

  
  // Prepare data for charts
  const monthlyChartData = {
    labels: processedData.monthLabels,
    datasets: [
      {
        data: processedData.monthLabels.map(month => processedData.monthly[month].expenses),
        strokeWidth: 2,
        color: () => `#007AFF`,
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(processedData.categories),
    datasets: [
      {
        data: Object.values(processedData.categories),
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      },
    ],
  };

  const maxValue = Math.max(...Object.values(processedData.categories));

  const yAxisMaximum = Math.ceil(maxValue / 1000) * 1000;

  const pieChartData = Object.entries(processedData.categories).map(([category, amount], index) => ({
    name: category,
    amount,
    color: [COLORS.secondary, COLORS.lightbackground, '#D1D1D8', '#EBEBF0'][index % 4],
    legendFontColor: COLORS.text.primary,
    legendFontSize: wp('3%'),
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <Header/>

      <ScrollView style={styles.content}>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Monthly Expenses (Last 5 Months)</Text>
          <LineChart
            data={monthlyChartData}
            width={screenWidth - wp('8%')}
            height={hp('28%')}
            yAxisLabel="₹"
            chartConfig={{
              backgroundColor: COLORS.primary,
              backgroundGradientFrom: COLORS.primary,
              backgroundGradientTo: COLORS.primary,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            bezier
            style={{
              marginVertical: hp('1%'),
              borderRadius: wp('4%'),
              alignSelf: 'center',
            }}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Category Breakdown (Last 5 Months)</Text>
          <BarChart
            data={categoryChartData}
            width={screenWidth - wp('8%')}
            height={hp('28%')}
            yAxisLabel="₹"
            chartConfig={{
              backgroundColor: COLORS.primary,
              backgroundGradientFrom: COLORS.primary,
              backgroundGradientTo: COLORS.primary,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              barPercentage: 0.7,
              propsForVerticalLabels: {
                fontSize: wp('3%'),
              },
              propsForHorizontalLabels: {
                fontSize: wp('3%'),
              },
              // Add these configurations to ensure the chart starts from zero
              formatYLabel: (value) => Math.round(value).toString(),
              segments: 5,
              // Set minimum value to 0 and maximum to calculated ceiling
              min: 0,
              max: yAxisMaximum
            }}
            style={{
              marginVertical: hp('1%'),
              borderRadius: wp('4%'),
              alignSelf: 'center',
            }}
            showValuesOnTopOfBars={true}
            fromZero={true}  // Add this prop to ensure the chart starts from zero
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Spending Distribution (Last 5 Months)</Text>
          <PieChart
            data={pieChartData}
            width={screenWidth - wp('8%')}
            height={hp('28%')}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              backgroundColor: 'transparent',
            }}
            accessor={'amount'}
            backgroundColor={'transparent'}
            paddingLeft={'15'}
            absolute
            style={{
              alignSelf: 'center',
            }}
          />
        </View>
      </ScrollView>

      <Animated.View
        style={[
          styles.footer,
          {
            height: footerAnimatedValue,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.footerContent}
          onPress={handleFooterPress}
        >
          <Text style={styles.footerText}>
            {isFooterExpanded
              ? 'Tap to hide AI-powered recommendations'
              : 'Tap to view AI-powered recommendations'}
          </Text>
          <Ionicons
            name={isFooterExpanded ? 'chevron-up' : 'chevron-down'}
            size={wp('6%')}
            color={COLORS.background}
          />
        </TouchableOpacity>

        {isFooterExpanded && (
  <View style={styles.recommendationsContainer}>
    <ScrollView>
      {recommendations.map((recommendation, index) => (
        <View key={index} style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>
            {recommendation.title}
          </Text>
          <Text style={styles.recommendationDescription}>
            {recommendation.description}
          </Text>
          <TouchableOpacity
            style={styles.recommendationButton}
            onPress={() => handleRecommendationPress(recommendation)}
          >
            <Text style={styles.recommendationButtonText}>
              {recommendation.buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  </View>
)}
      </Animated.View>
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
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: COLORS.background,
  },
  headerButton: {
    padding: wp('2%'),
  },
  logo: {
    width: wp('20%'),
    height: wp('8%'),
  },
  content: {
    flex: 1,
  },
  chartContainer: {
    marginVertical: hp('2%'),
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: wp('4.5%'),
    marginBottom: hp('1%'),
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  recommendationsContainer: {
    marginVertical: hp('2%'),
    justifyContent:"center",
  },
  recommendationCard: {
    alignSelf:"center",
    backgroundColor: COLORS.lightbackground,
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginVertical: hp('1%'),
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recommendationTitle: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: hp('1%'),
  },
  recommendationDescription: {
    fontSize: wp('3.5%'),
    color: COLORS.text.secondary,
    marginBottom: hp('1%'),
  },
  recommendationButton: {
    backgroundColor: COLORS.accent,
    borderRadius: wp('2%'),
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    alignSelf: 'flex-end',
  },
  recommendationButtonText: {
    fontSize: wp('3.5%'),
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: COLORS.secondary,
    borderTopLeftRadius: wp('4%'),
    borderTopRightRadius: wp('4%'),
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  footerContent: {
    paddingVertical: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: wp('2%'),
  },
  footerText: {
    color: COLORS.background,
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
  },
  recommendationText: {
    fontSize: wp('4%'),
    color: '#FFF', 
    padding: wp('4%'),
  },
  
});

export default Analysis;
