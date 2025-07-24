const {CognitoIdentityProviderClient, InitiateAuthCommand} = require("@aws-sdk/client-cognito-identity-provider")
const crypto = require('crypto');

const client = new CognitoIdentityProviderClient({
    region: process.env.REGION
})

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

exports.signIn = async (event) => {
    const {email, password} = JSON.parse(event.body);
    const secretHash = generateSecretHash(email, CLIENT_ID, CLIENT_SECRET);

    const params = {
        ClientId: CLIENT_ID,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
            SECRET_HASH: secretHash
        }
    }

    try {
        const command = new InitiateAuthCommand(params)
        const response = await client.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Signin Successful!",
                response: response
            })
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: "SignIn Failed",
                error: error.message
            })
        }
    }
}

function generateSecretHash(username, clientId, clientSecret) {
  const message = username + clientId;
  return crypto
    .createHmac('sha256', clientSecret)
    .update(message)
    .digest('base64');
}