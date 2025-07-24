const {S3Client, PutObjectCommand} = require("@aws-sdk/client-s3")
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner")

const client = new S3Client({
    region: process.env.REGION
})

const bucketName = process.env.BUCKET_NAME

exports.getUploadUrl = async (event) => {
    const {fileName, fileType} = JSON.parse(event.body)
    
    if(!fileName || !fileType) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "fileName and fileType are required"
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