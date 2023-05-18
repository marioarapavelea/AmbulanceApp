import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  TextInput,
} from "react-native";
import colors from "../colors";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth, database } from "../database/firebase";
import { db } from "../database/firebase";
import { ref, onValue } from "firebase/database";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import database from "@react-native-firebase/database";
import firebase from "../database/firebase";

const HomeScreen = () => {
  const [currentLocation, setCurrentLocation] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const [ambulanceLocations, setAmbulanceLocations] = useState([]);

  useEffect(() => {
    const databaseRef = ref(db, "ambulances/");
    onValue(databaseRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ambulanceList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setAmbulanceLocations(ambulanceList);
        console.log(ambulanceList);
      }
    });
  }, []);

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <FontAwesome
          name="search"
          size={24}
          color={colors.gray}
          style={{ marginLeft: 15 }}
        ></FontAwesome>
      ),
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

  const onSignOut = () => {
    signOut(auth).catch((error) => console.log("Error logging out: ", error));
  };

  // useEffect(() => {
  //   // Retrieve ambulance locations from Firebase and set up real-time updates
  //   const unsubscribe = firebase
  //     .database()
  //     .ref("ambulances")
  //     .on("value", (snapshot) => {
  //       const locations = snapshot.val();
  //       if (locations) {
  //         const ambulanceList = Object.keys(locations).map((key) => ({
  //           id: key,
  //           ...locations[key],
  //         }));
  //         setAmbulanceLocations(ambulanceList);
  //       }
  //     });

  //   // Clean up the listener when the component unmounts
  //   return () => {
  //     unsubscribe();
  //   };
  // }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Please grant location permission");
        setErrorMsg("Permission to access location was denied");
        return;
      }
      // let location = await Location.getCurrentPositionAsync({});
      let yourCurrentLocation = await Location.getCurrentPositionAsync({});
      setCurrentLocation(yourCurrentLocation);
      saveCurrentLocation(
        yourCurrentLocation.coords.latitude,
        yourCurrentLocation.coords.longitude
      );

      console.log("Location:");
      console.log(currentLocation);
    })();
  }, []);

  // useEffect(() => {
  //   const databaseRef = firebase.database().ref("locations");
  //   databaseRef.on("value", (snapshot) => {
  //     const data = snapshot.val();
  //     if (data) {
  //       const locationsArray = Object.values(data);
  //       setLocations(locationsArray);
  //     }
  //   });

  //   return () => {
  //     databaseRef.off("value");
  //   };
  // }, []);

  // const saveLocation = (latitude, longitude) => {
  //   const databaseRef = firebase.database().ref("locations");
  //   const locationRef = databaseRef.push();
  //   locationRef.set({ latitude, longitude });
  // };

  // const handleSearchLocation = async () => {
  //   let result = await Location.geocodeAsync(searchLocation);
  //   if (result.length > 0) {
  //     let location = result[0];
  //     setLocation({
  //       coords: {
  //         latitude: location.latitude,
  //         longitude: location.longitude,
  //       },
  //     });
  //   }
  // };
  // const handleDirections = () => {
  //   if (location && directions) {
  //     const { latitude, longitude } = location.coords;
  //     IntentLauncher.startActivityAsync(IntentLauncher.ACTION_VIEW, {
  //       data: `http://maps.google.com/maps?saddr=${latitude},${longitude}&daddr=${directions.latitude},${directions.longitude}`,
  //     });
  //   }
  // };

  return (
    <View style={styles.container}>
      {currentLocation && (
        <>
          <MapView
            style={styles.map}
            showsUserLocation={true}
            provider={PROVIDER_GOOGLE}
            followsUserLocation={true}
            initialRegion={{
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {ambulanceLocations.map((ambulance) => (
              <Marker
                key={ambulance.id}
                coordinate={{
                  latitude: ambulance.latitude,
                  longitude: ambulance.longitude,
                }}
                title="Ambulance"
                description="Ambulance location"
              />
            ))}
          </MapView>
        </>
      )}

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
  map: {
    width: "100%",
    height: "100%",
  },

  container2: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
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
  searchContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  searchButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  searchButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
