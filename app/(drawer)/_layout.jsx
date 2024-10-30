import React from "react";
import { View, Text, Image, StyleSheet, Linking, StatusBar } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

const CustomDrawerContent = (props) => {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <StatusBar 
        barStyle="light-content"
        backgroundColor="#2f2f2f"
        translucent={true}
      />
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: 'https://example.com/user-profile.jpg' }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>Team AUXIN</Text>
        <Text style={styles.userEmail}>Auxin@mnnit.com</Text>
      </View>
      <View style={styles.drawerItemsContainer}>
        {props.state.routes
          .filter((route) => route.name !== "(tabs)") // Filter out the unwanted route
          .map((route, index) => (
            <DrawerItem
              key={route.key}
              label={props.descriptors[route.key].options.drawerLabel || route.name}
              icon={props.descriptors[route.key].options.drawerIcon}
              onPress={() => props.navigation.navigate(route.name)}
            />
          ))}
        <DrawerItem
          label="Help"
          icon={() => <MaterialIcons name="help-outline" size={24} color="#555" />}
          onPress={() => Linking.openURL('https://example.com/help')}
        />
        <DrawerItem
          label="Feedback"
          icon={() => <MaterialIcons name="feedback" size={24} color="#555" />}
          onPress={() => Linking.openURL('https://forms.gle/5iJKWrfCXMsviTiL8')}
        />
        <DrawerItem
          label="Languages"
          icon={() => <Ionicons name="language" size={24} color="#555" />}
          onPress={() => console.log("Language options pressed")}
        />
        <DrawerItem
          label="Logout"
          icon={() => <MaterialIcons name="logout" size={24} color="#ff6b6b" />}
          onPress={() => console.log("Logout pressed")}
          labelStyle={{ color: "#ff6b6b" }}
        />
      </View>
    </DrawerContentScrollView>
  );
};

export default function Layout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '72%', 
        },
        swipeEnabled: true,
        drawerType: "front",
        overlayColor: 'rgba(0,0,0,0.7)',
        hideStatusBar: false,
        statusBarAnimation: 'slide',
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    />
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingTop: StatusBar.currentHeight,
  },
  profileContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#2f2f2f",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  userEmail: {
    fontSize: 14,
    color: "#ddd",
  },
  drawerItemsContainer: {
    flex: 1,
    paddingTop: 10,
  },
});
