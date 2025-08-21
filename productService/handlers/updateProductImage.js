const {DynamoDBClient, ScanCommand, UpdateItemCommand} = require("@aws-sdk/client-dynamodb")

const client = new DynamoDBClient({
    region: process.env.REGION
})

const tableName = process.env.DYNAMODB_TABLE
const region = process.env.REGION

exports.updateProductImage = async (event) => {
    const record = event.Records[0]
    
    const bucketName = record.s3.bucket.name
    const fileName = record.s3.object.key
    const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`

    const scanCommand = new ScanCommand({
        TableName: tableName,
        FilterExpression: "fileName = :fileName",
        ExpressionAttributeValues: {
            ":fileName": {S: fileName}
        }
    })

    const scanResult = await client.send(scanCommand)
    if(!scanResult.Items || scanResult.Items.length === 0) {
        console.log("Product Not Found");
        
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: "Product Not Found"
            })
        }
    }

    const productId = scanResult.Items[0].id.S

    console.log("ProductId: " + productId);
    

    const params = {
        TableName: tableName,
        Key: {id: {S: productId}},
        UpdateExpression: "SET imageUrl = :imageUrl",
        ExpressionAttributeValues: {
            ":imageUrl": {S: imageUrl}
        }
    }

    try {
        const command = new UpdateItemCommand(params)
        await client.send(command)

        console.log("Image Url updated successfully");
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Image Url updated successfully"
            })
        }
    } catch (error) {
        console.log(error.message);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: error.message
            })
        }
    }
    
}