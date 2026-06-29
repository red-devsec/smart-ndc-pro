import { Platform } from "react-native";

// Android emulator uses 10.0.2.2 to reach host
// iOS simulator uses localhost
// Physical device uses the server's IP
const DEVICE_HOST = Platform.select({
  android: "158.220.104.121",
  ios: "158.220.104.121",
  default: "158.220.104.121",
});

export const API_URL = `http://${DEVICE_HOST}:3001/api`;
export const SOCKET_URL = `http://${DEVICE_HOST}:3001`;
