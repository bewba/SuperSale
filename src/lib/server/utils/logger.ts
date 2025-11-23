import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Logs a message to the Supabase logs table
 * @param supabase - Supabase client instance
 * @param userId - User ID (can be null for system logs)
 * @param message - Log message
 * @param success - If action was successful (defaults to false)
 * @param type - 0 for general, 1 for logins, 2 for errors (defaults to 0)
 * @returns Promise that resolves when log is written
 */
export async function logEvent(
	supabase: SupabaseClient,
	userId: string | null,
	message: string,
	success: boolean | null = false,
	type: number | null = 0
): Promise<void> {
	// Normalize null values
	const normalizedSuccess = success ?? false;
	const normalizedType = type ?? 0;

	try {
		const { error } = await supabase.from('logs').insert([
			{
				user_id: userId,
				message: message,
				success: normalizedSuccess,
				type: normalizedType
			}
		]);

		if (error) {
			// Fallback to console if database logging fails
			console.error('Failed to write log to database:', error);
			console.log(
				`[LOG] ${userId || 'SYSTEM'}: ${message} (success: ${normalizedSuccess}, type: ${normalizedType})`
			);
		}
	} catch (err) {
		// Fallback to console if logging fails completely
		console.error('Logging error:', err);
		console.log(
			`[LOG] ${userId || 'SYSTEM'}: ${message} (success: ${normalizedSuccess}, type: ${normalizedType})`
		);
	}
}
