const {S3Client, PutObjectCommand} = require("@aws-sdk/client-s3")
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner")
const {DynamoDBClient, PutItemCommand} = require("@aws-sdk/client-dynamodb")
const {v4: uuid} = require("uuid")

const client = new S3Client({
    region: process.env.REGION
})

const dynamodbClient = new DynamoDBClient({
    region: process.env.REGION
})

const bucketName = process.env.BUCKET_NAME

exports.getUploadUrl = async (event) => {
    const {fileName, fileType, productName, productPrice, description, quantity, category, email} = JSON.parse(event.body)
    
    if(!fileName || !fileType || !productName || !productPrice
        || !description || !quantity || !category || !email) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "all fields are required"
            })
        }
    }

    const params = {
        Bucket: bucketName,
        Key: fileName,
        ContentType: fileType
    }

    const productId = uuid()
    try {
        const command = new PutObjectCommand(params)
        const signedUrl = await getSignedUrl(client, command, {expiresIn: 3600})
        
        const dynamodbCommand =  new PutItemCommand({
                                    TableName: process.env.DYNAMODB_TABLE,
                                    Item: {
                                        id: {S: productId},
                                        fileName: {S: fileName},
                                        productName: {S: productName},
                                        productPrice: {N: productPrice.toString()},
                                        description: {S: description},
                                        quantity: {N: quantity.toString()},
                                        category: {S: category},
                                        email: {S: email},
                                        isApproved: {BOOL: false},
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
        console.error(error.stack);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message
            })
        }
    }
}