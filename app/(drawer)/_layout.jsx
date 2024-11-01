import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Linking,
  StatusBar,
} from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants/theme";

const CustomDrawerContent = (props) => {
  const [selectedItem, setSelectedItem] = React.useState(null);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background} 
        translucent={true}
        hidden={false}
      />
      <View style={styles.profileContainer}>
        <Image
          source={require("../../assets/images/logoBlack.png")}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>Team AUXIN</Text>
        <Text style={styles.userEmail}>Auxin@mnnit.com</Text>
      </View>
      <View style={styles.drawerItemsContainer}>
        {props.state.routes
          .filter((route) => route.name !== "(tabs)")
          .map((route) => (
            <DrawerItem
              key={route.key}
              label={
                props.descriptors[route.key].options.drawerLabel || route.name
              }
              icon={props.descriptors[route.key].options.drawerIcon}
              labelStyle={{
                color: selectedItem === route.key ? COLORS.secondary : COLORS.text.primary, 
                fontWeight: selectedItem === route.key ? 'bold' : 'normal', 
              }}
              onPress={() => {
                setSelectedItem(route.key);
                props.navigation.navigate(route.name);
              }}
              style={{
                backgroundColor: selectedItem === route.key ? COLORS.primary : COLORS.lightbackground, 
              }}
            />
          ))}
        <DrawerItem
          label="Help"
          icon={() => (
            <MaterialIcons name="help-outline" size={wp("6%")} color={'#000000'} />
          )}
          onPress={() => Linking.openURL("https://forms.gle/5iJKWrfCXMsviTiL8")}
          labelStyle={{ color: COLORS.background }}
        />
        <DrawerItem
          label="Feedback"
          icon={() => (
            <MaterialIcons name="feedback" size={wp("6%")} color={'#000000'} />
          )}
          onPress={() => Linking.openURL("https://forms.gle/5iJKWrfCXMsviTiL8")}
          labelStyle={{ color: COLORS.background }}
        />
        <DrawerItem
          label="Languages"
          icon={() => <Ionicons name="language" size={wp("6%")} color={'#000000'} />}
          onPress={() => console.log("Language options pressed")}
          labelStyle={{ color: COLORS.background }}
        />
        <DrawerItem
          label="Export Data"
          icon={() => <Ionicons name="exit" size={wp("6%")} color={'#000000'} />}
          onPress={() => console.log("Export options pressed")}
          labelStyle={{ color: COLORS.background }}
        />
        <DrawerItem
          label="Logout"
          icon={() => (
            <MaterialIcons name="logout" size={wp("6%")} color="#ff6b6b" />
          )}
          onPress={() => console.log("Logout pressed")}
          labelStyle={{ color: "#ff6b6b" }} 
        />
      </View>
    </DrawerContentScrollView>
  );
};

export default function Layout({ navigation }) {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: wp("72%"),
        },
        swipeEnabled: true,
        drawerType: "front",
        overlayColor: "rgba(0,0,0,0.5)",
        hideStatusBar: false,
        statusBarAnimation: "slide",
      }}
      drawerContent={(props) => (
        <CustomDrawerContent {...props} navigation={navigation} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  profileContainer: {
    alignItems: "center",
    padding: wp("5%"),
    paddingTop: hp("5%"),
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightbackground,
  },
  profileImage: {
    width: wp("20%"),
    height: wp("20%"),
    resizeMode: "contain",
    borderRadius: wp("10%"),
    marginBottom: hp("1%"),
    backgroundColor: "#fff",
  },
  userName: {
    fontSize: wp("5%"),
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  userEmail: {
    fontSize: wp("3.5%"),
    color: COLORS.text.secondary,
    marginTop: hp("0.5%"),
  },
  drawerItemsContainer: {
    flex: 1,
    paddingTop: hp("1%"),
    marginTop: hp("1%"),
  },
});
