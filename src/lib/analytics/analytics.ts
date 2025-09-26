import { browser } from '$app/environment';
import { PUBLIC_AMPLITUDE_APIKEY } from '$env/static/public';

let amplitude: typeof import('@amplitude/analytics-browser') | null = null;

if (browser) {
	import('@amplitude/analytics-browser').then((mod) => {
		amplitude = mod;
		amplitude.init(PUBLIC_AMPLITUDE_APIKEY, { defaultTracking: true });
	});
}

export function track(event: string, data?: Record<string, any>) {
	if (amplitude) {
		amplitude.track(event, data);
	}
}
