import { atom } from 'jotai';
import { User } from '../types';

export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom((get) => !!get(userAtom));
export const userRoleAtom = atom((get) => get(userAtom)?.role || 'viewer');
