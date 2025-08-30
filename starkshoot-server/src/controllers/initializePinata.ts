import pinataSDK from "@pinata/sdk";

export function initializePinata() {
  const pinata = new pinataSDK({
    pinataApiKey: process.env.PINATA_API_KEY!,
    pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY!
  });
  return pinata;
}
