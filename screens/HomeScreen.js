import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  Button,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  animateToRegion,
  Callout,
} from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  getFirestore,
  QuerySnapshot,
  getDocs,
  where,
} from "firebase/firestore";
import { firebaseConfig } from "../database/firebase";
import * as Location from "expo-location";
import Geocoder from "react-native-geocoding";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import colors from "../colors";

const apiKey = "AIzaSyC3zC4Dx5XZgC-TgdT-vVwNEBJbLZ6sJeY";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getFirestore(app);
const db = getDatabase(app);

//Add some locations for ambulances
const addLocationToFirestore = async (
  ambulanceNumber,
  latitude,
  longitude,
  status
) => {
  const locationsRef = collection(database, "locations");
  // Check if the location already exists
  const querySnapshot = await getDocs(
    query(locationsRef, where("ambulanceNumber", "==", ambulanceNumber))
  );

  if (querySnapshot.empty) {
    // Location doesn't exist, add it to Firestore
    await addDoc(locationsRef, {
      ambulanceNumber: ambulanceNumber,
      latitude: latitude,
      longitude: longitude,
      status: status,
    });
    console.log("Location added to Firestore");
  } else {
    console.log("Location already exists in Firestore");
  }
};

addLocationToFirestore("A001", 46.770439, 23.591423, "free");
addLocationToFirestore("A002", 46.7609689, 23.5648915, "busy");
addLocationToFirestore("A003", 46.763968, 23.563625, "busy");
addLocationToFirestore("A004", 49.763968, 25.563625, "free");
addLocationToFirestore("A005", 46.758798, 23.551193, "free");
addLocationToFirestore("A006", 46.762507, 23.557183, "free");

//Get the location
const getLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (data) => resolve(data.coords),
      (err) => reject(err)
    );
  });
};

const geocodeLocationByName = (locationName) => {
  return new Promise((resolve, reject) => {
    Geocoder.from(locationName)
      .then((json) => {
        const addressComponent = json.results[0].address_components[0];
        resolve(addressComponent);
      })
      .catch((error) => reject(error));
  });
};

const geocodeLocationByCoords = (lat, long) => {
  return new Promise((resolve, reject) => {
    Geocoder.from(lat, long)
      .then((json) => {
        const addressComponent = json.results[0].address_components[0];
        resolve(addressComponent);
      })
      .catch((error) => reject(error));
  });
};

const HomeScreen = (props) => {
  const navigation = useNavigation();

  const [currentLocation, setCurrentLocation] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [pinPosition, setPinPosition] = useState(region);
  const mapRef = useRef(null);
  const [region, setRegion] = useState({
    latitude: 46.770439,
    longitude: 23.591423,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  //Ambulances simulation
  const fetchLocations = async () => {
    const locationsRef = collection(database, "locations");
    onSnapshot(locationsRef, (snapshot) => {
      const locationsData = snapshot.docs.map((doc) => doc.data());
      setLocations(locationsData);
    });
  };
  useEffect(() => {
    fetchLocations();
  }, []);

  //Zoom to location
  const zoomToLocation = (latitude, longitude) => {
    const region = {
      latitude,
      longitude,
      latitudeDelta: 0.001,
      longitudeDelta: 0.001,
    };
    mapRef.current.animateToRegion(region, 1000); // Adjust the animation duration as needed
  };

  //Navigation
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <FontAwesome
          name="user"
          size={24}
          color={colors.gray}
          style={{ marginLeft: 15 }}
          onPress={() => navigation.navigate("Profile")}
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

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Please grant location permission");
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let yourCurrentLocation = await Location.getCurrentPositionAsync({});
      setCurrentLocation(yourCurrentLocation);

      console.log("Location:");
      console.log(currentLocation);
      setPinPosition({
        latitude: yourCurrentLocation.coords.latitude,
        longitude: yourCurrentLocation.coords.longitude,
      });
    })();
  }, []);

  // Search for a location

  const getInitialState = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission not granted");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      console.log(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      });
    } catch (error) {
      console.log("Error getting current location:", error);
    }
  };

  const getCoordsFromName = async (loc) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${loc}&key=${apiKey}`
      );
      const data = await response.json();
      const { lat, lng } = data.results[0].geometry.location;
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setPinPosition({ latitude: lat, longitude: lng });
      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.log("Error retrieving location coordinates:", error);
    }
  };

  const onMapRegionChange = (region) => {
    setRegion(region);
    // setPinPosition(region);
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerSearch}>
        <GooglePlacesAutocomplete
          placeholder="Search location"
          minLength={2}
          autoFocus={true}
          returnKeyType={"search"}
          listViewDisplayed={TextInput.length > 0}
          fetchDetails={true}
          onPress={(data, details = null) => {
            // getCoordsFromName(details.geometry.location);
            getCoordsFromName(details.formatted_address);
          }}
          query={{
            key: apiKey,
            language: "en",
          }}
          nearbyPlacesAPI="GooglePlacesSearch"
          debounce={200}
          styles={{
            container: {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1, // Adjust the zIndex value as needed
            },
            textInputContainer: {
              backgroundColor: "rgba(0,0,0,0)",
              borderTopWidth: 0,
              borderBottomWidth: 0,
            },
            textInput: {
              marginLeft: 0,
              marginRight: 0,
              height: 38,
              color: "#5d5d5d",
              fontSize: 16,
            },
            listView: {
              backgroundColor: "transparent", // Set the background color of the suggestions container to transparent
            },
            predefinedPlacesDescription: {
              color: "#1faadb",
            },
          }}
        />
      </View>
      {/* locations.length > 0 && region.latitude && */}
      {region && (
        <View style={styles.container}>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            showsUserLocation={true}
            // followsUserLocation={true}
            onRegionChange={onMapRegionChange}
            scrollEnabled={true}
            zoomEnabled={true}
            // provider={PROVIDER_GOOGLE}
          >
            {/* <Marker coordinate={region} /> */}
            {pinPosition && (
              <Marker
                coordinate={pinPosition}
                draggable
                onDragEnd={(e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  setPinPosition({
                    latitude,
                    longitude,
                    latitudeDelta: 0.003,
                    longitudeDelta: 0.003,
                  });
                }}
              />
            )}

            {locations.map((ambulance, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: ambulance.latitude,
                  longitude: ambulance.longitude,
                }}
                onPress={() =>
                  zoomToLocation(ambulance.latitude, ambulance.longitude)
                }
              >
                <FontAwesome
                  name="ambulance"
                  size={24}
                  color={ambulance.status === "free" ? "green" : "red"}
                />

                <Callout style={styles.calloutContainer}>
                  <Text style={styles.ambulanceNumber}>
                    Ambulance Number: {ambulance.ambulanceNumber}
                  </Text>
                </Callout>
              </Marker>
            ))}
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
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerSearch: {
    zIndex: 1,
  },
  map: {
    flex: 1,
  },
  container2: {
    justifyContent: "flex-end",
    flexDirection: "row",
    height: 55,

    backgroundColor: "transparent",
    zIndex: 2,
    position: "absolute",
    bottom: 0,
    right: 0,
    margin: 16,
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
  calloutContainer: {
    width: 200,
  },
  ambulanceNumber: {
    fontWeight: "bold",
  },
});
