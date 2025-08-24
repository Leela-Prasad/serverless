const {DynamoDBClient, PutItemCommand} = require("@aws-sdk/client-dynamodb")

const client = new DynamoDBClient({
    region: process.env.REGION
})

const tableName = process.env.DYNAMODB_TABLE

exports.processOrder = async (event) => {
    try {
        console.log(event);
        const record = event.Records[0]
        const orderData =JSON.parse(record.body)

        console.log(orderData);
        
        const {id, productId, quantity, email, status, createdAt} = orderData    

        const command = new PutItemCommand({
            TableName: tableName,
            Item: {
                id: {S: id},
                productId: {S: productId},
                quantity: {N: quantity.toString()},
                email: {S: email},
                status: {S: status},
                createdAt: {S: createdAt}
            }
        })

        console.log("Command :: ", command);
        

        await client.send(command)

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Order Placed Successfully, OrderId :: " + orderId
            })
        }
    } catch (error) {
        console.log("error", error.message);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message
            })
        }
    }
    

}