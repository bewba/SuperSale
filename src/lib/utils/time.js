// src/lib/utils/time.js
export function formatTime(ms) {
	const hours = Math.floor(ms / (1000 * 60 * 60));
	const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((ms % (1000 * 60)) / 1000);
	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function getTimeLeft(expiresAt, currentTime) {
	const timeLeft = expiresAt - currentTime;
	return timeLeft > 0 ? timeLeft : 0;
}

export function getDiscountedPrice(original, discount) {
	return Math.round(original * (1 - discount / 100));
}
