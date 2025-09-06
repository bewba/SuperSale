import * as nodemailer from 'nodemailer';
import { v4 } from 'uuid';
import { SMTP_EMAIL, SMTP_PASSWORD } from '$env/static/private';

if (!SMTP_EMAIL || !SMTP_PASSWORD) throw Error('[ERROR:ENV]: Missing SMTP setup.');
/**
 * Nodemailer instance we use.
 */
const transporter = nodemailer.createTransport({
	service: 'Gmail',
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {
		user: SMTP_EMAIL,
		pass: SMTP_PASSWORD
	}
});

/**
 * Sends an email with the given params
 *
 * @param subject
 * @param    html_content
 */
export const sendSingleEmail = ({
	sender,
	subject,
	recipient,
	content
}: {
	sender?: string;
	subject: string;
	recipient: string;
	content: string;
}): Promise<void> => {
	return new Promise<void>((resolve, reject) => {
		transporter.sendMail(
			{
				from: sender ?? SMTP_EMAIL,
				to: recipient,
				subject,
				html: content
			},
			(error, info) => {
				if (error) {
					console.error('[ERROR] Could not send email.');
					console.error('[-----] ' + error.message);
					reject(error);
				} else {
					console.log('[LOG] Email sent to ' + recipient);
					resolve();
				}
			}
		);
	});
};

//Use like this
