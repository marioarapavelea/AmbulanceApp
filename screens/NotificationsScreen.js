import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Input } from "react-native-elements/dist/input/Input";
import { TouchableOpacity } from "react-native-gesture-handler";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import { firebaseConfig } from "../database/firebase";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { Alert } from "react-native";

const NotificationsScreen = () => {
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertLocation, setAlertLocation] = useState("");

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getDatabase(app);
  const database = getFirestore(app);

  const onHandleAlert = async () => {
    try {
      const alertData = {
        title: alertTitle,
        message: alertMessage,
        location: alertLocation,
      };

      const docRef = await addDoc(collection(database, "alerts"), alertData);
      console.log("Document written with ID: ", docRef.id);

      // Reset the input fields
      setAlertTitle("");
      setAlertMessage("");
      setAlertLocation("");
      // Display alert with the message details
      Alert.alert(alertTitle, `${alertMessage}\nLocation: ${alertLocation}`);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  return (
    <View>
      <Text
        style={{
          fontWeight: "bold",
          color: "orange",
          fontSize: 18,
          margin: 20,
        }}
      >
        NotificationsScreen
      </Text>
      <Input
        placeholder="Message Title"
        value={alertTitle}
        onChangeText={(text) => setAlertTitle(text)}
      ></Input>
      <Input
        placeholder="Message"
        value={alertMessage}
        onChangeText={(text) => setAlertMessage(text)}
      ></Input>
      <Input
        placeholder="Location"
        value={alertLocation}
        onChangeText={(text) => setAlertLocation(text)}
      ></Input>
      <TouchableOpacity style={styles.button} onPress={onHandleAlert}>
        <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
          {" "}
          Send Alert
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#f57c00",
    height: 58,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
});
