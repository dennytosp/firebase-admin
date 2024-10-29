import * as admin from "firebase-admin";
import { SEVER_KEY_PATH } from "./common";

const serviceAccount = require(SEVER_KEY_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function generateFirebaseCustomToken(
  uid: string
): Promise<string | undefined> {
  try {
    const customToken = await admin.auth().createCustomToken(uid);
    console.log("Firebase Custom Token (JWT):", customToken);
    return customToken;
  } catch (error) {
    console.error("Error generating Firebase Custom Token:", error);
  }
}

generateFirebaseCustomToken("user-uid");
