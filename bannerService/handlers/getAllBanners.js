const {DynamoDBClient, ScanCommand} = require("@aws-sdk/client-dynamodb")

const client = new DynamoDBClient({
    region: process.env.REGION
})

const tableName = process.env.TABLE_NAME
const region = process.env.REGION

exports.getAllBanners = async () => {
    const scanCommand = new ScanCommand({
        TableName: tableName
    })

    try {
        const {Items} = await client.send(scanCommand)

        if(!Items || Items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify("No Banners found")
            }
        }
        
        const banners = Items.map(item => ({
                            imageUrl: item.ImageUrl.S
                        }))

        return {
            statusCode: 200,
            body: JSON.stringify(banners)
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