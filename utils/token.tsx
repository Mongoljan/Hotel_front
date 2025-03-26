// utils/token.ts
import {jwtDecode} from "jwt-decode";

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (err) {
    return true; // invalid token
  }
};
