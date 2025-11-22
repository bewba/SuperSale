// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import type PocketBase from 'pocketbase';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface Locals {
			supabase: SupabaseClient;
			user: User | null;
			pb: PocketBase;
			userRole: string | null;
			auth: () => Promise<any>;
			session: Session | null;
			userId: string | null;
		}
	}
}
export {};
