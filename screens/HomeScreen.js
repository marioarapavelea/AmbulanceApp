import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import colors from "../colors";
import { Entypo } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

// const catImageUrl =
//   "https://i.guim.co.uk/img/media/26392d05302e02f7bf4eb143bb84c8097d09144b/446_167_3683_2210/master/3683.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=49ed3252c0b2ffb49cf8b508892e452d";

const HomeScreen = () => {
  const [location, setLocation] = useState();

  useEffect(() => {
    const getPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Please grant location permission");
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      console.log("Location:");
      console.log(location);
    };
    getPermission();
  }, []);

  let text = "Waiting..";
  if ("Permission to access location was denied") {
    text = "Permission to access location was denied";
  } else if (location) {
    text = JSON.stringify(location);
  }

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <FontAwesome
          name="search"
          size={24}
          color={colors.gray}
          style={{ marginLeft: 15 }}
        />
      ),
      // headerRight: () => (
      //   <Image
      //     source={{ uri: catImageUrl }}
      //     style={{
      //       width: 40,
      //       height: 40,
      //       marginRight: 15,
      //     }}
      //   />
      // ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* <Text>{currentLocation}</Text> */}
      <MapView style={styles.map}>
        <Marker coordinate={location} />
      </MapView>
      <View style={styles.container2}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Chat")}
          style={styles.chatButton}
        >
          <Entypo name="chat" size={24} color={colors.lightGray} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // alignItems: "center",
    justifyContent: "center",
  },
  container2: {
    // flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    // backgroundColor: "#fff",
  },
  chatButton: {
    backgroundColor: colors.primary,
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    marginRight: 20,
    marginBottom: 50,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
