const {CognitoIdentityProviderClient, ForgotPasswordCommand} = require("@aws-sdk/client-cognito-identity-provider")
const crypto = require('crypto');

const client = new CognitoIdentityProviderClient({
    region: process.env.REGION
})

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

exports.forgotPassword = async (event) => {

    const {email} = JSON.parse(event.body)
    const secretHash = generateSecretHash(email, CLIENT_ID, CLIENT_SECRET);

    const params = {
        ClientId: CLIENT_ID,
        Username: email,
        SecretHash: secretHash,
    }

    try {
        const command = new ForgotPasswordCommand(params)
        await client.send(command)

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Password Reset Initiated, Please check your email"
            })
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
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