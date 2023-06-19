import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Image,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import colors from "../colors";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { getAuth, deleteUser } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, remove } from "firebase/database";
import { firebaseConfig } from "../database/firebase";
import { CheckBox } from "react-native-elements";

const DeleteAccountScreen = () => {
  const navigation = useNavigation();

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getDatabase(app);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <FontAwesome
          name="chevron-left"
          size={24}
          color={colors.gray}
          style={{ marginLeft: 15 }}
          onPress={() => navigation.goBack()}
        ></FontAwesome>
      ),
    });
  }, [navigation]);

  const [confirmationChecked, setConfirmationChecked] = useState(false);

  const handleDeleteAccount = () => {
    if (!confirmationChecked) {
      Alert.alert(
        "Confirmation",
        "Please confirm your decision by checking the checkbox."
      );
      return;
    }

    const user = auth.currentUser;

    if (user) {
      // Delete user data from the real-time database
      const userId = user.uid;
      const userRef = ref(db, `users/${userId}`);

      remove(userRef)
        .then(() => {
          // User data deleted successfully
          // Proceed with deleting the account
          deleteUser(user)
            .then(() => {
              // Account deleted successfully
              Alert.alert(
                "Success",
                "Your account and data have been deleted."
              );
              setTimeout(() => {
                navigation.navigate("Login");
              }, 3000);
            })
            .catch((error) => {
              // An error occurred while deleting the account
              Alert.alert(
                "Error",
                "Unable to delete your account. Please try again later."
              );
              console.error("Error deleting account:", error);
            });
        })
        .catch((error) => {
          // An error occurred while deleting user data from the real-time database
          Alert.alert(
            "Error",
            "Unable to delete your data. Please try again later."
          );
          console.error("Error deleting user data:", error);
        });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Delete Profile</Text>
        <Text style={styles.textStyle}>
          Are you sure you want to delete your account? This action is
          irreversible.
        </Text>
        <CheckBox
          title="I confirm that I want to delete my account"
          checked={confirmationChecked}
          onPress={() => setConfirmationChecked(!confirmationChecked)}
          containerStyle={styles.checkboxContainer}
          textStyle={styles.checkboxLabel}
        />

        <TouchableOpacity style={styles.button} onPress={handleDeleteAccount}>
          <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
            {" "}
            Delete Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DeleteAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    marginTop: 20,
    alignSelf: "left",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "orange",
  },
  textStyle: {
    color: "#888",
    marginTop: 20,
    marginRight: 10,
    fontSize: 16,
  },
  textStyleForm: {
    color: "#888",
    marginRight: 10,
    fontSize: 14,
  },
  form: {
    flex: 1,
    marginHorizontal: 30,
  },
  field: { padding: 5 },
  input: {
    backgroundColor: "#F6F7FB",
    height: 58,
    marginTop: 10,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
  },

  button: {
    backgroundColor: "#f57c00",
    height: 58,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  checkboxContainer: {
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
    margin: 20,
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 16,
  },
});
