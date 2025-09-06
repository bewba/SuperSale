import { SvelteKitAuth } from '@auth/sveltekit';
import Facebook from '@auth/sveltekit/providers/facebook';
import Google from '@auth/sveltekit/providers/google';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [Google({}), Facebook({})]
});
