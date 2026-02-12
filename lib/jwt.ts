import { SignJWT, jwtVerify, JWTPayload } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface CustomJWTPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function generateToken(payload: CustomJWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(
  token: string
): Promise<CustomJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as CustomJWTPayload;
  } catch {
    return null;
  }
}
