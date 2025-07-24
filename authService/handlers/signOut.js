const {CognitoIdentityProviderClient, GlobalSignOutCommand} = require("@aws-sdk/client-cognito-identity-provider")

const client = new CognitoIdentityProviderClient({
    region: process.env.REGION
})

exports.signOut = async (event) => {
    const {accessToken} = JSON.parse(event.body)

    const params = {
        AccessToken: accessToken
    }

    try {
        const command = new GlobalSignOutCommand(params)
        await client.send(command)
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "User Successfully Signed out"
            })
        }
    } catch(error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: "signout failed",
                error: error.message
            })
        }
    }
    
}