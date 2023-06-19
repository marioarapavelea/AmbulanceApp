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

import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  updatePassword,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import { firebaseConfig } from "../database/firebase";

const ChangePasswordScreen = () => {
  const navigation = useNavigation();

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getDatabase(app);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

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

  const handleChangePassword = () => {
    const user = auth.currentUser;
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (user) {
      updatePassword(user, newPassword)
        .then(() => {
          console.log("Password updated successfully!");
          Alert.alert("Success", "Your password has been updated");
          setTimeout(() => {
            navigation.navigate("Home");
          }, 3000);
        })
        .catch((error) => {
          console.log("Error updating password:", error);

          // Show an error message to the user
        });
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create new password</Text>
        <Text style={styles.textStyle}>
          Your new password must be different from previous used passwords.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.textStyle}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={true}
            textContentType="password"
            value={newPassword}
            onChangeText={setNewPassword}
          ></TextInput>
          <Text style={styles.textStyleForm}>
            Must be at least 6 characters.
          </Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.textStyle}>Confirm Password</Text>
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
            secureTextEntry
            style={styles.input}
          ></TextInput>
          <Text style={styles.textStyleForm}>Both passwords must match.</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
            {" "}
            Change Password
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChangePasswordScreen;

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
});
