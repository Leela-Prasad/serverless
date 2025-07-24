const {DynamoDBClient, PutItemCommand} = require("@aws-sdk/client-dynamodb")

const client = new DynamoDBClient({
    region: process.env.REGION
})

const bucketName = process.env.BUCKET_NAME
const tableName = process.env.TABLE_NAME
const region = process.env.REGION

exports.confirmUpload = async (event) => {
    console.log(event)
    
    const record = event.Records[0]

    const fileName = record.s3.object.key
    const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`

    const params = {
        TableName: tableName,
        Item: {
            fileName: {S: fileName},
            ImageUrl: {S: imageUrl},
            createdAt: {S: new Date().toISOString()}
        }
    }

    try {
        const command = new PutItemCommand(params)
        await client.send(command)

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "File uploaded and confirmed"
            })
        }
    } catch (error) {
        return {
            statusCode: 500,
            error: error.message
        }
    }
}