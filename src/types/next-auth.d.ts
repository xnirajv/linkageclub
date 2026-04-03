import 'next-auth';
import { UserRole } from './user';

declare module 'next-auth' {
  interface User {
    id: string;
    role: UserRole;
    trustScore: number;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      image?: string;
      trustScore: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    trustScore: number;
  }
}