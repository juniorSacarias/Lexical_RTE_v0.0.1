import { auth } from '@volenday/sdk';


const loginWithCredentials = async () => {
	try {
		const response = await auth.loginWithEmail({
			apiKey: process.env.REACT_APP_AUTH_API_KEY,
			emailAddress: process.env.REACT_APP_AUTH_EMAIL_ADDRESS,
			headers: {},
			environment: process.env.REACT_APP_AUTH_ENVIRONMENT,
			password: process.env.REACT_APP_AUTH_PASSWORD,
			rememberMe: false
		});
		console.log(response);
		return response;
	} catch (error) {
		console.log(error);
	}
};

export default loginWithCredentials;
