import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/db/client';
import connectDB from '@/lib/db/connect';
import bcrypt from 'bcryptjs';
import User from '@/lib/db/models/user';

export const authOptions: NextAuthOptions = {
  adapter: process.env.MONGODB_URI ? MongoDBAdapter(clientPromise) : undefined,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })]
      : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select('+password');

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        if (!user.emailVerified) {
          throw new Error('Please verify your email first');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
          trustScore: user.trustScore,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // first login
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.trustScore = (user as any).trustScore;
        token.name = user.name;
      }

      if (trigger === "update" && session) {
        token.name = session.user?.name || token.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).trustScore = token.trustScore as number;
        session.user.name = token.name as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          await connectDB();
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            await User.create({
              email: user.email,
              name: user.name,
              avatar: user.image,
              emailVerified: true,
              role: 'student',
            });
          } else if (!existingUser.emailVerified) {
            existingUser.emailVerified = true;
            await existingUser.save();
          }
        } catch (error) {
          console.error('SignIn error:', error);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
    newUser: '/signup',
  },
  events: {
    async signIn({ user }) {
      try {
        await connectDB();
        await User.updateOne(
          { _id: user.id },
          { $set: { lastActive: new Date() } }
        );
      } catch (error) {
        console.error('Event signIn error:', error);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
