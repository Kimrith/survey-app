import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    idToken?: string;
    roles?: string[];
    user: {
      id?: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    accessToken?: string;
    idToken?: string;
    roles?: string[];
  }
}
