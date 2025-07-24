const {S3Client, PutObjectCommand} = require("@aws-sdk/client-s3")
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner")
const {DynamoDBClient, PutItemCommand} = require("@aws-sdk/client-dynamodb")

const client = new S3Client({
    region: process.env.REGION
})

const dynamodbClient = new DynamoDBClient({
    region: process.env.REGION
})

const bucketName = process.env.BUCKET_NAME

exports.getUploadUrl = async (event) => {
    const {fileName, fileType, categoryName} = JSON.parse(event.body)
    
    if(!fileName || !fileType || !categoryName) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "fileName, fileType and categoryName are required"
            })
        }
    }

    const params = {
        Bucket: bucketName,
        Key: fileName,
        ContentType: fileType
    }

    try {
        const command = new PutObjectCommand(params)
        const signedUrl = await getSignedUrl(client, command, {expiresIn: 3600})

        const dynamodbCommand =  new PutItemCommand({
                                    TableName: process.env.DYNAMODB_TABLE,
                                    Item: {
                                        fileName: {S: fileName},
                                        categoryName: {S: categoryName},
                                        createdAt: {S: new Date().toISOString()}
                                    }
                                })

        await dynamodbClient.send(dynamodbCommand)

        return {
            statusCode: 200,
            body: JSON.stringify({
                uploadUrl: signedUrl
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