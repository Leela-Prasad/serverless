const {DynamoDBClient, PutItemCommand} = require("@aws-sdk/client-dynamodb")
const {v4: uuid} = require("uuid")
const axios = require("axios")
const {SQSClient, SendMessageCommand} = require("@aws-sdk/client-sqs")
const {SFNClient, StartExecutionCommand} = require("@aws-sdk/client-sfn")

// const client = new DynamoDBClient({
//     region: process.env.REGION
// })

const sqsClient = new SQSClient({
    region: process.env.REGION
})

const sfnClient = new SFNClient({
    region: process.env.REGION
})
const tableName = process.env.DYNAMODB_TABLE
const region = process.env.REGION

exports.placeOrder = async (event) => {
    const {id, quantity, email} = JSON.parse(event.body)

    // Extracting email from JWT ID Token
    // const email = event.requestContext.authorizer.jwt.claims.email
    if(!id || !quantity || !email) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "fields are required"
            })
        }
    }

    try {
        const productResponse = await axios.get("https://k7lgft6eo6.execute-api.ap-south-1.amazonaws.com/dev/approved-products")

        const approvedProducts = productResponse.data.products || []

        const product = approvedProducts.find(p => p.id?.S === id)

        if(!product) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: "Product not found or not approved"
                })
            }
        }

        const totalQuantity = parseInt(product.quantity.N || "0")
        if(totalQuantity < quantity) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Insufficient Stock"
                })
            }
        }

        const orderId = uuid()
        const orderPayload = {
            id: orderId,
            productId: id,
            quantity: quantity,
            email: email,
            status: "pending",
            createdAt: new Date().toISOString()
        }

        await sqsClient.send(new SendMessageCommand({
            QueueUrl: process.env.SQS_ORDER_QUEUE_URL,
            MessageBody: JSON.stringify(orderPayload)
        }))

        await sfnClient.send(new StartExecutionCommand({
            stateMachineArn: process.env.STEP_FUNCTION_ARN,
            input: JSON.stringify({...orderPayload})
        }))

        // const command = new PutItemCommand({
        //     TableName: tableName,
        //     Item: {
        //         id: {S: orderId},
        //         productId: {S: id},
        //         quantity: {N: quantity.toString()},
        //         email: {S: email},
        //         status: "pending",
        //         createdAt: new Date().toISOString()
        //     }
        // })

        // await client.send(command)

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Order Placed Successfully, OrderId :: " + orderId
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