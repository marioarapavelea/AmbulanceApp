import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { TouchableOpacity, Text } from "react-native";
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
import { ref, onValue } from "firebase/database";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import colors from "../colors.js";
import { registerForPushNotificationsAsync } from "expo-notifications";

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
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

        // Retrieve city
        const fullNameRef = ref(db, `users/${uid}/fullName`);
        onValue(fullName, (snapshot) => {
          const fullNameValue = snapshot.val();
          setFullName(fullNameValue);
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
          // user: {
          //   _id: auth.currentUser.uid,
          //   name: username,
          // },
        }))
      );
    });
    return unsubscribe;
  }, []);

  // const renderBubble = (props) => {
  //   const { currentMessage } = props;

  //   // Check if the current message has a user object and name property
  //   const isUserMessage =
  //     currentMessage.user && currentMessage.user._id === auth.currentUser.uid;

  //   // Customizing the message bubble style for user and other messages
  //   const bubbleStyle = {
  //     left: {
  //       backgroundColor: isUserMessage ? "#f0f0f0" : "#e5e5e5",
  //     },
  //     right: {
  //       backgroundColor: isUserMessage ? "#dcf8c6" : "#ffffff",
  //     },
  //   };

  //   return <Bubble {...props} wrapperStyle={bubbleStyle} />;
  // };

  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
    // setMessages([...messages, ...messages]);
    const { _id, createdAt, text, user } = messages[0];
    addDoc(collection(database, "chats"), {
      _id,
      createdAt,
      text,
      user,
    });
  }, []);

  return (
    // <>
    //   {messages.map(message => (
    //     <Text key={message._id}>{message.text}</Text>
    //   ))}
    // </>
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
        // avatar: "https://i.pravatar.cc/300",
        avatar:
          "https://cdn3.iconfinder.com/data/icons/vector-icons-6/96/256-512.png",
        name: username,
      }}
      // renderBubble={renderBubble}
    />
  );
}
