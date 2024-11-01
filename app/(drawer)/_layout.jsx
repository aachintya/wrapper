import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Linking,
  StatusBar,
  Modal,
  TouchableOpacity,
} from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from 'react-i18next';
import { useGlobalContext } from './../../components/globalProvider';
import { COLORS } from "../../constants/theme";


const CustomDrawerContent = (props) => {
 

  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { state, dispatch, changeLanguage } = useGlobalContext();
  const { t ,i18n} = useTranslation();

  const handleLanguageSelect = (language) => {
    console.log("Current language in state:", state.language);
    changeLanguage(language);
    setIsModalVisible(false); 
    console.log("Language changed to", language);
};

useEffect(() => {
    
  if (state.language && i18n.language !== state.language) {
    i18n.changeLanguage(state.language);
  }
  else{
    i18n.changeLanguage('en');
  }
}, [state.language]);

  return (
    <>
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
          <Text style={styles.userName}>{t('teamAuxin')}</Text>
          <Text style={styles.userEmail}>{t('Email')}</Text>
        </View>
        <View style={styles.drawerItemsContainer}>
          {props.state.routes
            .filter((route) => route.name !== "(tabs)")
            .map((route) => (
              <DrawerItem
                key={route.key}
                label={t(props.descriptors[route.key].options.drawerLabel || route.name)}
                icon={props.descriptors[route.key].options.drawerIcon}
                labelStyle={{
                  color: selectedItem === route.key ? COLORS.secondary : COLORS.text.primary,
                  fontWeight: selectedItem === route.key ? "bold" : "normal",
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
            label={t('Help')}
            icon={() => <MaterialIcons name="help-outline" size={wp("6%")} color={"#000000"} />}
            onPress={() => Linking.openURL("https://forms.gle/5iJKWrfCXMsviTiL8")}
            labelStyle={{ color: COLORS.background }}
          />
          <DrawerItem
            label={t('Feedback')}
            icon={() => <MaterialIcons name="feedback" size={wp("6%")} color={"#000000"} />}
            onPress={() => Linking.openURL("https://forms.gle/5iJKWrfCXMsviTiL8")}
            labelStyle={{ color: COLORS.background }}
          />
          <DrawerItem
            label={t('Language')}
            icon={() => <Ionicons name="language" size={wp("6%")} color={"#000000"} />}
            onPress={() => setIsModalVisible(true)}
            labelStyle={{ color: COLORS.background }}
          />
         
          <DrawerItem
            label={t('Export Data')}
            icon={() => <Ionicons name="exit" size={wp("6%")} color={"#000000"} />}
            onPress={() => console.log("Export options pressed")}
            labelStyle={{ color: COLORS.background }}
          />
          <DrawerItem
            label={t('Logout')}
            icon={() => <MaterialIcons name="logout" size={wp("6%")} color="#ff6b6b" />}
            onPress={() => console.log("Logout pressed")}
            labelStyle={{ color: "#ff6b6b" }}
          />
        </View>
      </DrawerContentScrollView>

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
            {["English", "Hindi", "Tamil"].map((language) => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.languageOption,
                  state.language === language && styles.selectedLanguage
                ]}
                onPress={() => handleLanguageSelect(language)}
              >
                <Text style={[
                  styles.languageText,
                  state.language === language && styles.selectedLanguageText
                ]}>
                  {language}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: wp("80%"),
  },
  modalTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  languageOption: {
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
    backgroundColor: "#f0f0f0",
  },
  selectedLanguage: {
    backgroundColor: COLORS.primary,
  },
  languageText: {
    fontSize: wp("4%"),
    textAlign: "center",
  },
  selectedLanguageText: {
    color: "white",
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: wp("4%"),
  },
});