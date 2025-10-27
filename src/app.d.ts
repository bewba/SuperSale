// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface Locals {
			supabase: ReturnType<
				typeof import('@supabase/auth-helpers-sveltekit').createSupabaseServerClient
			>;
			user: User | null;
			pb: PocketBase;
			userRole: String | null;
		}
	}
}
export {};
