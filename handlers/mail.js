const nodemailer = require('nodemailer');
const pug        = require('pug');
const juice      = require('juice');
const htmlToText = require('html-to-text');
const promisify  = require('es6-promisify');


const transport = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	secure:false,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS
	}
});
// transport.sendMail({
// 	from: 'Mohamed AShraf Othman',
// 	to: 'mohamedashrafothman@gmail.com',
// 	subject: 'Just traying things',
// 	html: 'Hey There, I <strong>Love</strong> you',
// 	text:'Hey there, I **Love** you' 
// });
module.exports.send = async (options) => {
	const mailOptions = {
		from: `Mohamed Ashraf <mido.ma201096@gmail.com>`,
		to: options.company.contacts['email'],
		subject: options.subject,
		html: 'fill latter',
		text: 'fill latter'
	};
	const sendMail = promisify(transport.sendMail, transport);
	return sendMail(mailOptions);
};