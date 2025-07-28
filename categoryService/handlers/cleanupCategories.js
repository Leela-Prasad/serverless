const {DynamoDBClient, ScanCommand, DeleteItemCommand} = require("@aws-sdk/client-dynamodb")
const {SNSClient, PublishCommand}= require("@aws-sdk/client-sns")

const client = new DynamoDBClient({
    region: process.env.REGION
})

const snsClient = new SNSClient({
    region: process.env.REGION
})
const tableName = process.env.DYNAMODB_TABLE
const snsTopicArn = process.env.SNS_CATEGORY_CLEANUP_TOPIC_ARN

exports.cleanupCategories = async () => {

    try {
       const fiveMinsAgo = new Date(Date.now() - 5*60*1000).toISOString()

        const scanCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: "createdAt < :fiveMinsAgo AND attribute_not_exists(imageUrl)",
            ExpressionAttributeValues: {
                ":fiveMinsAgo": {S: fiveMinsAgo}
            }
        })

        const {Items} = await client.send(scanCommand)

        if(!Items || Items.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({message: "No Categories found for cleanup"})
            }
        }

        let deletedCount = 0
        for(const item of Items) {
            const deleteCommand = new DeleteItemCommand({
                TableName: tableName,
                Key: {fileName: item.fileName}
            })

            await client.send(deleteCommand)
            ++deletedCount
        }

        const message = `Category Cleanup completed, ${deletedCount} records are deleted`
        await snsClient.send(new PublishCommand({
            TopicArn: snsTopicArn,
            Message: message,
            Subject: "Category Cleanup Notification"
        }))

        return{
            statusCode: 200,
            body: JSON.stringify({message: `${deletedCount} records are deleted`})
        } 
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({message: error.message})
        }
    }
}