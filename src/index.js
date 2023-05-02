import { load } from 'cheerio'

const TEMPLATE_NAME = 'frase_del_dia';
const TEMPLATE_LANGUAGE_CODE = 'es';
const API_VERSION_NUMBER = 'v16.0';


export default {
	async scheduled(event, env, ctx) {
		ctx.waitUntil(sendDailyMessage());
	},
};

async function sendDailyMessage() {
	try {
		const { quoteOfTheDay, authorOfTheDay } = await getQuoteOfTheDay()

		console.log({ quoteOfTheDay, authorOfTheDay });

		const resutl = await Promise.allSettled([
			RECIPIENT_PHONE_NUMBERS.map(RECIPIENT_PHONE_NUMBER =>
				fetch(`https://graph.facebook.com/${API_VERSION_NUMBER}/${PHONE_NUMBER_ID}/messages`, {
					headers: {
						Authorization: `Bearer ${ACCESS_TOKEN}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						"messaging_product": "whatsapp",
						"to": RECIPIENT_PHONE_NUMBER,
						"type": "template",
						"template": {
							"name": TEMPLATE_NAME,
							"language": {
								"code": TEMPLATE_LANGUAGE_CODE
							},
							components: [
								{
									"type": "body",
									"parameters": [
										{
											"type": "text",
											"text": quoteOfTheDay
										},
										{
											"type": "text",
											"text": authorOfTheDay
										}
									]
								}
							]
						}
					}),
					method: "POST",
				})
			)])
		console.log('resutl', resutl)
		return
	} catch (e) {
		console.error('Error:', e)
		return
	}
}

async function getQuoteOfTheDay() {
	const quotesPage = await fetch('https://proverbia.net/frase-del-dia')
		.then(res => res.text())
	const quotesPageDOM = load(quotesPage)
	const quoteOfTheDay = quotesPageDOM('blockquote p').first().text().trim()
	const authorOfTheDay = quotesPageDOM('footer a').first().text().trim()
	return { quoteOfTheDay, authorOfTheDay }
}
