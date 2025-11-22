import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Logs a message to the Supabase logs table
 * @param supabase - Supabase client instance
 * @param userId - User ID (can be null for system logs)
 * @param message - Log message
 * @returns Promise that resolves when log is written
 */
export async function logEvent(
	supabase: SupabaseClient,
	userId: string | null,
	message: string
): Promise<void> {
	try {
		const { error } = await supabase.from('logs').insert([
			{
				user_id: userId,
				message: message
			}
		]);

		if (error) {
			// Fallback to console if database logging fails
			console.error('Failed to write log to database:', error);
			console.log(`[LOG] ${userId || 'SYSTEM'}: ${message}`);
		}
	} catch (err) {
		// Fallback to console if logging fails completely
		console.error('Logging error:', err);
		console.log(`[LOG] ${userId || 'SYSTEM'}: ${message}`);
	}
}


