// src/routes/protected/admin/api/logs/+server.ts
import { json, redirect, type RequestHandler } from '@sveltejs/kit';
import { logEvent } from '$lib/server/utils/logger';

export const GET: RequestHandler = async ({ locals, url }) => {
	// Only admins can view logs (not moderators)
	if (locals.userRole !== 'admin') {
		await logEvent(
			locals.supabase,
			locals.userId,
			`Access control failure: User with role "${locals.userRole}" attempted to access logs (required: admin)`
		);
		throw redirect(302, '/unauthorized');
	}

	const supabase = locals.supabase;

	const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
	const offset = parseInt(url.searchParams.get('offset') || '0', 10);
	const search = url.searchParams.get('search')?.trim() ?? '';

	try {
		// If searching, first find matching user IDs by email
		let matchingUserIds: string[] = [];
		if (search) {
			const { data: usersData } = await supabase
				.from('users')
				.select('id')
				.ilike('email', `%${search}%`);

			if (usersData) {
				matchingUserIds = usersData.map((u: any) => u.id);
			}
		}

		// Build query for logs - fetch logs matching message or user
		let allLogs: any[] = [];
		let totalCount = 0;

		if (search) {
			// Fetch logs matching message
			const messageQuery = supabase
				.from('logs')
				.select('id, user_id, message, created_at', { count: 'exact' })
				.ilike('message', `%${search}%`)
				.order('created_at', { ascending: false });

			const { data: messageLogs, error: messageError, count: messageCount } = await messageQuery;

			if (messageError) {
				console.error('❌ fetchLogs message search error:', messageError);
			} else {
				if (messageLogs) allLogs.push(...messageLogs);
				totalCount = messageCount ?? 0;
			}

			// Fetch logs matching user IDs
			if (matchingUserIds.length > 0) {
				const userQuery = supabase
					.from('logs')
					.select('id, user_id, message, created_at')
					.in('user_id', matchingUserIds)
					.order('created_at', { ascending: false });

				const { data: userLogs, error: userError } = await userQuery;

				if (userError) {
					console.error('❌ fetchLogs user search error:', userError);
				} else {
					if (userLogs) {
						// Merge and deduplicate by id
						const existingIds = new Set(allLogs.map((l: any) => l.id));
						userLogs.forEach((log: any) => {
							if (!existingIds.has(log.id)) {
								allLogs.push(log);
							}
						});
					}
				}
			}

			// Sort by created_at descending
			allLogs.sort((a: any, b: any) => {
				return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			});

			totalCount = allLogs.length;
			// Apply pagination
			allLogs = allLogs.slice(offset, offset + limit);
		} else {
			// No search - fetch normally
			const query = supabase
				.from('logs')
				.select('id, user_id, message, created_at', { count: 'exact' })
				.order('created_at', { ascending: false })
				.range(offset, offset + limit - 1);

			const { data, error, count } = await query;

			if (error) {
				console.error('❌ fetchLogs error:', error);
				return json({ error: error.message }, { status: 500 });
			}

			allLogs = data ?? [];
			totalCount = count ?? 0;
		}

		// Get user emails for logs that have user_id
		const userIds = [...new Set((allLogs ?? []).map((log: any) => log.user_id).filter(Boolean))];
		const userMap = new Map<string, string>();

		if (userIds.length > 0) {
			const { data: usersData } = await supabase
				.from('users')
				.select('id, email')
				.in('id', userIds);

			if (usersData) {
				usersData.forEach((user: any) => {
					userMap.set(user.id, user.email || 'Unknown');
				});
			}
		}

		// Format logs with user email
		const logs = (allLogs ?? []).map((log: any) => ({
			id: log.id,
			user_id: log.user_id,
			user_email: log.user_id ? userMap.get(log.user_id) || 'Unknown' : null,
			message: log.message,
			created_at: log.created_at
		}));

		return json({ logs, count: totalCount });
	} catch (err: any) {
		console.error('❌ fetchLogs exception:', err);
		return json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
	}
};
