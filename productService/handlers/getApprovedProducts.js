const {DynamoDBClient, ScanCommand} = require("@aws-sdk/client-dynamodb")

const client = new DynamoDBClient({
    region: process.env.REGION
})

const tableName = process.env.DYNAMODB_TABLE
const region = process.env.REGION

exports.getApprovedProducts = async () => {
    const scanCommand = new ScanCommand({
        TableName: tableName,
        FilterExpression: "isApproved = :isApproved",
        ExpressionAttributeValues: {
            ":isApproved": {BOOL: true}
        }
    })

    const {Items} = await client.send(scanCommand)

    return {
        statusCode: 200,
        body: JSON.stringify({
            products: Items || []
        })
    }
}