import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import IndexScreen from './(tabs)';



export default function DrawerNavigator() {
    return (
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home tabs" component={(Tabs)}  />
  
      </Drawer.Navigator>
    );
  }