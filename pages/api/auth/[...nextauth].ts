import NextAuth from 'next-auth';
import { authOptions } from '@/lib/googleAuth';
 
export default NextAuth(authOptions); 