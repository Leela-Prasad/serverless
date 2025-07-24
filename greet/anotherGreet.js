exports.anotherGreet = async (event) => {
    const body = JSON.parse(event.body);

    const name = body.name;

    try {
        if(!name) {
            return {
                statusCode: 400,
                body: JSON.stringify ({
                    msg: "Name is requried"
                })
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: `Hello ${name}, Welcome to the Application`
            })
        }
    } catch(error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: "An Error Occurred while processing"
            })  
        }
    }
    
}