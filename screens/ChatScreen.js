import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { TouchableOpacity, Text, Alert } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, database, db } from "../database/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, runTransaction } from "firebase/database";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import colors from "../colors.js";

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [firstUserAccepted, setFirstUserAccepted] = useState(false);
  const [firstUserUsername, setFirstUserUsername] = useState("");

  const onSignOut = () => {
    signOut(auth).catch((error) => console.log("Error logging out: ", error));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 10,
          }}
          onPress={onSignOut}
        >
          <AntDesign
            name="logout"
            size={24}
            color={colors.gray}
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;

        // Retrieve username
        const usernameRef = ref(db, `users/${uid}/username`);
        onValue(usernameRef, (snapshot) => {
          const usernameValue = snapshot.val();
          setUsername(usernameValue);
        });
      }
    });

    return () => {
      // Clean up the subscription when the component unmounts
      unsubscribe();
    };
  }, []);

  useLayoutEffect(() => {
    const collectionRef = collection(database, "chats");
    const q = query(collectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log("message sent");

      setMessages(
        querySnapshot.docs.map((doc) => ({
          _id: doc.data()._id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        }))
      );

      const latestMessage = querySnapshot.docs[0].data();
      const { _id, user } = latestMessage;

      // Display an alert with the received message and options to accept/decline
      Alert.alert(
        "New Message",
        latestMessage.text,
        [
          {
            text: "Accept",
            onPress: () => handleAccept(_id, user),
          },
          {
            text: "Decline",
            onPress: () => handleDecline(_id),
            style: "cancel",
          },
        ],
        { cancelable: false }
      );
    });
    return unsubscribe;
  }, []);

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
    console.log("First user username:", firstUserUsername);
  };

  const handleDecline = (messageId) => {
    // Handle the logic for declining the message
    console.log("Declined message:", messageId);
  };

  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );

    const { _id, createdAt, text, user } = messages[0];
    addDoc(collection(database, "chats"), {
      _id,
      createdAt,
      text,
      user,
    });
  }, []);

  return (
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={false}
      showUserAvatar={false}
      onSend={(messages) => onSend(messages)}
      messagesContainerStyle={{
        backgroundColor: "#fff",
      }}
      textInputStyle={{
        backgroundColor: "#fff",
        borderRadius: 20,
      }}
      renderUsernameOnMessage={true} // default is false
      user={{
        _id: auth?.currentUser?.email,
        avatar:
          "https://cdn3.iconfinder.com/data/icons/vector-icons-6/96/256-512.png",
        name: username,
      }}
    />
  );
}
