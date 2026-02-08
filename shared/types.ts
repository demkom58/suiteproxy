export interface SuitemakerCreds {
  cookie: string;
  at: string;
  api_key: string;
  build: string;
  flow_id: string;
  nonce: string;
  toggles: string[];
  authUser: string;
}

// The gRPC-web array format for GenerateContent
// Based on: ["models/gemini-2.5-flash-image",[[[[null,"Hi!"]],"user"]],null,[...]...]
export type SuitemakerRPCRequest = [
  string,          // 0: Model Name (e.g. "models/gemini-1.5-flash")
  any[],           // 1: Contents (History)
  any,             // 2: System Instruction
  any[],           // 3: Generation Config
  string | null,   // 4: at token (SNlM0e)
  null,            // 5: Padding
  null,            // 6: Padding
  null,            // 7: Padding
  null,            // 8: Padding
  null,            // 9: Padding
  number           // 10: Purpose/Flag
];

export interface AccountRecord {
  id: string;
  creds: string;
  last_sync: number;
  limited_until: number;
}

export interface GoogleCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
}

export interface WizData {
  SNlM0e: string; // at
  PeqOqb: string; // api_key
  cfb2h: string;   // build
  FdrFJe: string; // flow_id
  WZsZ1e: string; // nonce
}