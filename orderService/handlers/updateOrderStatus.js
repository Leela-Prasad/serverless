const {DynamoDBClient, UpdateItemCommand} = require("@aws-sdk/client-dynamodb")

const client = new DynamoDBClient({
    region: process.env.REGION
})

const tableName = process.env.DYNAMODB_TABLE


exports.updateOrderStatus = async (event) => {
    try {
        console.log(event);
        const {id} = event

        const command = new UpdateItemCommand({
            TableName: tableName,
            Key: {id: {S: id}},
            UpdateExpression: "set #s = :newStatus",
            ExpressionAttributeNames: {
                "#s": "status"
            },
            ExpressionAttributeValues: {
                ":newStatus": {S: "processing"}
            }
        })

        console.log(command);
        
        await client.send(command)

        return {
            statusCode: 200, 
            body: JSON.stringify({
                    message: `order ${id} status updated to processing`
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