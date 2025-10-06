import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import type { NextAuthOptions } from "next-auth";
import clientPromise from "./mongodb";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(clientPromise),
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const client: MongoClient = await clientPromise;
                const db = client.db();
                const user = await db.collection("users").findOne({ email: credentials.email.toLowerCase() });
                if (!user || !user.passwordHash) return null;

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
                if (!isValid) return null;

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name || user.email,
                    role: user.role || "free",
                } as any;
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
            ? [GithubProvider({ clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! })]
            : []),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                const client: MongoClient = await clientPromise;
                const db = client.db();
                const users = db.collection("users");
                const accounts = db.collection("accounts"); // your OAuth links

                if (user?.email && account) {
                    const email = user.email.toLowerCase();
                    let existingUser = await users.findOne({ email });

                    if (!existingUser) {
                        const insertResult = await users.insertOne({
                            email,
                            name: user.name,
                            image: (user as any).image,
                            role: "free",
                            createdAt: new Date(),
                            passwordSet: false,
                        });
                        existingUser = { ...insertResult, _id: insertResult.insertedId };
                    }

                    // Link OAuth account
                    const existingAccount = await accounts.findOne({
                        provider: account.provider,
                        providerAccountId: account.providerAccountId,
                    });
                    if (!existingAccount) {
                        await accounts.insertOne({
                            userId: existingUser._id,
                            provider: account.provider,
                            providerAccountId: account.providerAccountId,
                            type: account.type,
                            access_token: account.access_token,
                            refresh_token: account.refresh_token,
                            expires_at: account.expires_at,
                        });
                    }
                }
            } catch (e) {
                console.error("SignIn error:", e);
            }
            return true;
        }
        ,
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role || token.role || "free";
            } else {
                // refresh role from DB periodically if needed
                if (!token.role && token.email) {
                    try {
                        const client: MongoClient = await clientPromise;
                        const db = client.db();
                        const existing = await db.collection("users").findOne({ email: (token.email as string).toLowerCase() });
                        if (existing?.role) token.role = existing.role;
                    } catch { }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = (token as any).role || "free";
            }
            return session;
        },
    },
};

export default authOptions;


