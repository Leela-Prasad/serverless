const {SESClient, SendEmailCommand} = require("@aws-sdk/client-ses")

const client = new SESClient({
    region: process.env.REGION
})

exports.sendEmail = async (event) => {
    const {toEmail, orderId, productName, quantity} = event
    const emailParams = {
        Source: "leelajobs239@gmail.com",
        Destination: {
            ToAddresses: [toEmail]
        },
        Message: {
            Subject: {
                Data: "Your Order Confirmation"
            },
            Body: {
                Text: {
                    Data: `Thank You for your Order\n\nOrder Id: ${orderId}\nProduct: ${productName}`
                }
            }
        }
    }

    try {
        const command = new SendEmailCommand(emailParams)
        await client.send(command)        
    } catch (error) {
        throw new Error(error.message || "Unknown Error")
    }
}