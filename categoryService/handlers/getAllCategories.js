const {DynamoDBClient, ScanCommand} = require("@aws-sdk/client-dynamodb")

const client = new DynamoDBClient({
    region: process.env.REGION
})

const tableName = process.env.DYNAMODB_TABLE
const region = process.env.REGION

exports.getAllCategories = async () => {
    const scanCommand = new ScanCommand({
        TableName: tableName
    })

    try {
        const {Items} = await client.send(scanCommand)

        if(!Items || Items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify("No Categories found")
            }
        }
        
        const categories = Items.map(item => ({
                            categoryName: item.categoryName.S,
                            imageUrl: item.imageUrl.S
                        }))

        return {
            statusCode: 200,
            body: JSON.stringify(categories)
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