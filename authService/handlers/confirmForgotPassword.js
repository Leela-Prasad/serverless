const {CognitoIdentityProviderClient, ConfirmForgotPasswordCommand} = require("@aws-sdk/client-cognito-identity-provider")
const crypto = require('crypto');

const client = new CognitoIdentityProviderClient({
    region: process.env.REGION
})

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

exports.confirmForgotPassword = async (event) => {
    const {email, code, newPassword} = JSON.parse(event.body)
    const secretHash = generateSecretHash(email, CLIENT_ID, CLIENT_SECRET);

    const params = {
        ClientId: CLIENT_ID,
        Username: email,
        SecretHash: secretHash,
        ConfirmationCode: code,
        Password: newPassword
    }

    try {
        const command = new ConfirmForgotPasswordCommand(params)
        await client.send(command)

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Password has been Successfully reset"
            })
        }
    } catch (error) {
        return {
            statusCode: 500,
            error: error.message
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