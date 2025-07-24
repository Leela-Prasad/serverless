const {DynamoDBClient, PutItemCommand} = require("@aws-sdk/client-dynamodb")
const {v4: uuidv4} = require("uuid")

const client = new DynamoDBClient({
    region: process.env.PROCESS
})

const TABLE_NAME = "Users"

class UserModel {
    constructor(email, fullName) {
        this.userId = uuidv4()
        this.email = email
        this.fullName = fullName
        this.state = ""
        this.city = ""
        this.locality = ""
        this.createdAt = new Date().toISOString()
    }

    async save() {
        const params = {
            TableName: TABLE_NAME,
            Item: {
                userId: {S: this.userId},
                email: {S: this.email},
                fullName: {S: this.fullName},
                state: {S: this.state},
                city: {S: this.city},
                locality: {S: this.locality},
                createdAt: {S: this.createdAt}
            }
        }

        try {
            const command = new PutItemCommand(params)
            await client.send(command)    
        } catch (error) {
            throw error
        }
    }
}

module.exports = UserModel

