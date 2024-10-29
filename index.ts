import axios from "axios";
import * as admin from "firebase-admin";
import { GoogleAuth } from "google-auth-library";
import * as path from "path";
import { DEVICE_TOKEN, SEVER_KEY_PATH } from "./common";

const serviceAccountPath = path.resolve(__dirname, SEVER_KEY_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

const NOTIFICATION_TITLE = "KOI Thé sent a message";
const NOTIFICATION_BODY = "Unlock a 10% discount on your first order!";

const getOAuthToken = async (): Promise<string | undefined> => {
  try {
    const auth = new GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: [
        "https://www.googleapis.com/auth/firebase",
        "https://www.googleapis.com/auth/cloud-platform",
      ],
    });

    const authClient = await auth.getClient();
    const tokenResponse = await authClient.getAccessToken();
    const accessToken = tokenResponse?.token ?? undefined;

    if (accessToken) {
      console.log("OAuth 2.0 Access Token retrieved:", accessToken);
      logCurlCommand(accessToken);
      // await sendNotification(accessToken);
    } else {
      console.error("Failed to generate OAuth 2.0 Access Token.");
    }

    return accessToken;
  } catch (error) {
    console.error("Error generating OAuth 2.0 Access Token:", error);
  }
};

const sendNotification = async (token: string) => {
  try {
    const response = await axios.post(
      "https://fcm.googleapis.com/v1/projects/koi-sg-uat/messages:send",
      {
        message: {
          token: DEVICE_TOKEN,
          notification: {
            title: NOTIFICATION_TITLE,
            body: NOTIFICATION_BODY,
            image:
              "https://lh4.googleusercontent.com/proxy/51C4SDOhrRnA0vgklsN6HKDATxdGT_zlGyhvoAys3idTK0Jb-jcBiA8jjC8fpkUxvaxgA1oV_krx47X5dKcdO_HDM5EzT3telp5wOKRaDEBc8A_Er6QM2A0tjuBLx23OOg",
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Notification sent successfully:", response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error sending notification:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unknown error:", error);
    }
  }
};

const logCurlCommand = (token: string) => {
  const curlCommand = `
curl --location 'https://fcm.googleapis.com/v1/projects/koi-sg-uat/messages:send' \\
--header 'Authorization: Bearer ${token}' \\
--header 'Content-Type: application/json' \\
--data '{
    "message": {
        "token": ${DEVICE_TOKEN},
        "notification": {
            "title": ${NOTIFICATION_TITLE},
            "body": ${NOTIFICATION_BODY},
            "image": "https://lh4.googleusercontent.com/proxy/51C4SDOhrRnA0vgklsN6HKDATxdGT_zlGyhvoAys3idTK0Jb-jcBiA8jjC8fpkUxvaxgA1oV_krx47X5dKcdO_HDM5EzT3telp5wOKRaDEBc8A_Er6QM2A0tjuBLx23OOg"
        }
    }
}'
  `;

  console.log("\nUse the following cURL command to test the FCM API:");
  console.log(curlCommand);
};

getOAuthToken();
