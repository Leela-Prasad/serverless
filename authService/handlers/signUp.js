const {CognitoIdentityProviderClient, SignUpCommand} = require("@aws-sdk/client-cognito-identity-provider")
const crypto = require('crypto');
const UserModel = require("../models/UserModel")

const client = new CognitoIdentityProviderClient({
    region: process.env.REGION
})

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET


exports.signUp = async (event) => {
    const {email, password, fullName} = JSON.parse(event.body)
    const secretHash = generateSecretHash(email, CLIENT_ID, CLIENT_SECRET);

    const params = {
        ClientId: CLIENT_ID,
        Username: email,
        Password: password,
        SecretHash: secretHash,
        UserAttributes: [
            {Name: "email", Value: email},
            {Name: "name", Value: fullName}
        ]
    }

    try {
        const command = new SignUpCommand(params)
        await client.send(command)

        const newUser = new UserModel(email, fullName)
        await newUser.save()

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "User Successfully Signed up! Please verify your email"
            })
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: "signup failed",
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
