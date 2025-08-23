const {DynamoDBClient, PutItemCommand} = require("@aws-sdk/client-dynamodb")
const {v4: uuid} = require("uuid")
const axios = require("axios")

const client = new DynamoDBClient({
    region: process.env.REGION
})

const tableName = process.env.DYNAMODB_TABLE
const region = process.env.REGION

exports.placeOrder = async (event) => {
    const {id, quantity, email} = JSON.parse(event.body)

    if(!id || !quantity || !email) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "fields are required"
            })
        }
    }

    try {
        const productResponse = await axios.get("https://k7lgft6eo6.execute-api.ap-south-1.amazonaws.com/dev/approved-products")

        const approvedProducts = productResponse.data.products || []

        const product = approvedProducts.find(p => p.id?.S === id)

        if(!product) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: "Product not found or not approved"
                })
            }
        }

        const totalQuantity = parseInt(product.quantity.N || "0")
        if(totalQuantity < quantity) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Insufficient Stock"
                })
            }
        }

        const orderId = uuid()
        const command = new PutItemCommand({
            TableName: tableName,
            Item: {
                id: {S: orderId},
                productId: {S: id},
                quantity: {N: quantity.toString()},
                email: {S: email}
            }
        })

        await client.send(command)

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Order Placed Successfully" + orderId
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