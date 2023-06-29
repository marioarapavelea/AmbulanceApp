import { StyleSheet, Text, View, Alert, Image } from "react-native";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, runTransaction } from "firebase/database";
import { firebaseConfig } from "../database/firebase";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import colors from "../colors.js";
const emergencyImg = require("../images/emergency-alarm-icon.jpg");

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertLocation, setAlertLocation] = useState("");
  const [firstUserAccepted, setFirstUserAccepted] = useState(false);
  const [firstUserUsername, setFirstUserUsername] = useState("");

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getDatabase(app);
  const database = getFirestore(app);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <FontAwesome
          name="chevron-left"
          size={24}
          color={colors.gray}
          style={{ marginLeft: 15 }}
          onPress={() => navigation.navigate("Home")}
        ></FontAwesome>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    console.log("First user username:", firstUserUsername);
  }, [firstUserUsername]);

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

      // Display alert with the message details and handle button presses
      Alert.alert(alertTitle, `${alertMessage}\nLocation: ${alertLocation}`, [
        { text: "Accept", onPress: () => handleAccept() },
        { text: "Decline", onPress: () => handleDecline() },
      ]);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleAccept = (messageId, user) => {
    if (!firstUserAccepted) {
      setFirstUserAccepted(true);

      const currentUser = auth.currentUser;
      if (currentUser) {
        const uid = currentUser.uid;

        // Retrieve username
        const usernameRef = ref(db, `users/${uid}/username`);
        onValue(usernameRef, (snapshot) => {
          const usernameValue = snapshot.val();
          setFirstUserUsername(usernameValue);

          // Update the status of the first user to "busy" in the Realtime Database
          const userStatusRef = ref(db, `users/${uid}/status`);
          runTransaction(userStatusRef, (currentData) => {
            if (currentData === "free") {
              // Set the status to "busy" only if the current status is "free"
              return "busy";
            }
            return currentData;
          })
            .then(() => {
              console.log("First user status updated to busy");
            })
            .catch((error) => {
              console.log("Error updating user status:", error);
            });
        });
      }
    }

    // Handle the logic for accepting the message
    console.log("Accepted message:", messageId);
  };

  const handleDecline = () => {
    // Implement any actions that should happen when the alert is declined
    console.log("Declined the alert");
    // You can perform any other actions here that should happen when the alert is declined
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send an alert</Text>
      <View style={styles.imgContainer}>
        <Image source={emergencyImg} style={styles.backImage} />
      </View>

      <View style={styles.form}>
        <TextInput
          placeholder="Message Title"
          value={alertTitle}
          onChangeText={(text) => setAlertTitle(text)}
          style={styles.input}
        ></TextInput>
        <TextInput
          placeholder="Message"
          value={alertMessage}
          onChangeText={(text) => setAlertMessage(text)}
          style={styles.input}
        ></TextInput>

        <TextInput
          placeholder="Location"
          value={alertLocation}
          onChangeText={(text) => setAlertLocation(text)}
          style={styles.input}
        ></TextInput>
        <TouchableOpacity style={styles.button} onPress={onHandleAlert}>
          <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
            {" "}
            Send Alert
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "orange",
    alignSelf: "center",
    paddingTop: 30,
  },
  form: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 30,
    width: "80%",
  },
  input: {
    backgroundColor: "#F6F7FB",
    height: 58,
    marginBottom: 20,
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
  backImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  imgContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 150,
  },
});
