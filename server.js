const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const axios = require("axios");

// Endpoint for sending push notifications
app.post("/send-push-notification", (req, res) => {
  const { expoPushTokens, title, body } = req.body;

  // Construct the FCM API request payload
  const message = {
    registration_ids: expoPushTokens,
    notification: {
      title,
      body,
    },
  };

  // Make a POST request to the FCM API
  axios
    .post("https://fcm.googleapis.com/fcm/send", message, {
      headers: {
        Authorization: `key=AAAA7MJ6jKs:APA91bF7m5x-A8cXJhTbJBfLCR6QgedOFFzXCs-LihXP9BtanniNb-NtbFAT6C6sTIHHYzHZHi1t2DA-ANSTzKdvnpr-qHyYSanIER_2IxVPZprqKI4ed44xalTwH7myvtKunwjwNeiO`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log("Push notification sent successfully");
      res.status(200).json({ success: true });
    })
    .catch((error) => {
      console.error("Failed to send push notification:", error);
      res.status(500).json({ error: "Failed to send push notification" });
    });
});
