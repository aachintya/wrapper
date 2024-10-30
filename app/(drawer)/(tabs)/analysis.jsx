import React, { useState, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import Header from '../../../components/commonheader';

const Analysis = () => {
  const navigation = useNavigation();
  const [recommendations, setRecommendations] = useState([
    {
      title: 'Optimize your Spending',
      description: "We noticed you've been spending a lot on entertainment. Here are some tips to save money in that category.",
      buttonText: 'View Recommendations',
    },
    {
      title: 'Increase Savings',
      description: 'Your current savings rate is low compared to your income. We suggest setting up an automatic transfer to your savings account.',
      buttonText: 'Adjust Savings',
    },
    {
      title: 'Reduce Utility Costs',
      description: 'You could be saving money on your utility bills. Here are some energy-efficient tips to try.',
      buttonText: 'Explore Savings',
    },
  ]);

  const [footerHeight, setFooterHeight] = useState(hp('6%'));
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);
  const footerAnimatedValue = useRef(new Animated.Value(footerHeight)).current;

  const handleFooterPress = () => {
    Animated.timing(footerAnimatedValue, {
      toValue: isFooterExpanded ? hp('6%') : hp('50%'),
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsFooterExpanded(!isFooterExpanded);
  };

  const screenWidth = Dimensions.get('window').width;

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
          <Text style={styles.chartTitle}>Spending Over Time</Text>
          <LineChart
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  data: [500, 800, 650, 900, 750, 1000],
                  strokeWidth: 2,
                  color: () => `#007AFF`,
                },
              ],
            }}
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
          <Text style={styles.chartTitle}>Category Breakdown</Text>
          <BarChart
            data={{
              labels: ['Food', 'Rent', 'Entertainment', 'Utilities'],
              datasets: [
                {
                  data: [400, 600, 300, 200],
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                },
              ],
            }}
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
            style={{
              marginVertical: hp('1%'),
              borderRadius: wp('4%'),
              alignSelf: 'center',
            }}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Spending Breakdown</Text>
          <PieChart
            data={[
              {
                name: 'Food',
                amount: 400,
                color: COLORS.secondary,
                legendFontColor: COLORS.text.primary,
                legendFontSize: wp('3%'),
              },
              {
                name: 'Rent',
                amount: 600,
                color: COLORS.lightbackground,
                legendFontColor: COLORS.text.primary,
                legendFontSize: wp('3%'),
              },
              {
                name: 'Entertainment',
                amount: 300,
                color: '#D1D1D8',
                legendFontColor: COLORS.text.primary,
                legendFontSize: wp('3%'),
              },
              {
                name: 'Utilities',
                amount: 200,
                color: '#EBEBF0',
                legendFontColor: COLORS.text.primary,
                legendFontSize: wp('3%'),
              },
            ]}
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

  const handleRecommendationPress = (recommendation) => {
    // Handle the recommendation press, e.g., navigate to a specific screen or perform an action
    console.log('Recommendation pressed:', recommendation);
  };
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
});

export default Analysis;