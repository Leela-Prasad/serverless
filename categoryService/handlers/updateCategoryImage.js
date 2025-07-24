const {DynamoDBClient, UpdateItemCommand} = require("@aws-sdk/client-dynamodb")

const client = new DynamoDBClient({
    region: process.env.REGION
})

const tableName = process.env.DYNAMODB_TABLE
const region = process.env.REGION

exports.updateCategoryImage = async (event) => {
    const record = event.Records[0]
    
    const bucketName = record.s3.bucket.name
    const fileName = record.s3.object.key
    const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`

    const params = {
        TableName: tableName,
        Key: {fileName: {S: fileName}},
        UpdateExpression: "SET imageUrl = :imageUrl",
        ExpressionAttributeValues: {
            ":imageUrl": {S: imageUrl}
        }
    }

    try {
        const command = new UpdateItemCommand(params)
        await client.send(command)

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Image Url updated successfully"
            })
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: error.message
            })
        }
    }
    
}