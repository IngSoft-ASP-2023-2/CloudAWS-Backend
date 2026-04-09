const express = require('express');
const aws = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

aws.config.update({
    region: process.env.REGION
});

const dynamoDBOptions = { region: process.env.REGION };
if (process.env.DYNAMODB_ENDPOINT) {
    dynamoDBOptions.endpoint = process.env.DYNAMODB_ENDPOINT;
}
const dynamoDB = new aws.DynamoDB.DocumentClient(dynamoDBOptions);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

const snsOptions = { region: process.env.REGION };
if (process.env.SNS_ENDPOINT) {
    snsOptions.endpoint = process.env.SNS_ENDPOINT;
}
const sns = new aws.SNS(snsOptions);

app.use(express.json());

function publishToSNS(message) {
    if (!process.env.SNS_ARN) return;

    const params = {
        Message: JSON.stringify(message),
        TopicArn: process.env.SNS_ARN
    };

    sns.publish(params, (err, data) => {
        if (err) console.error('Error when publish to SNS:', err);
        else console.log('Message sended to SNS:', data.MessageId);
    });
}

app.post('/movies', async (req, res) => {
    const movieData = req.body;
    const movieId = uuidv4();

    const params = {
        TableName: TABLE_NAME,
        Item: {
            movie_id: movieId,
            ...movieData,
        },
    };

    try {
        await dynamoDB.put(params).promise();
        publishToSNS(movieData);
        res.status(200).json({ message: 'Película insertada correctamente', insertedId: movieId });
    } catch (err) {
        console.error('Error al insertar la película: ', err);
        res.status(500).send('Error al insertar la película.');
    }
});

app.get('/movies', async (req, res) => {
    const params = {
        TableName: TABLE_NAME,
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        res.status(200).json(data.Items);
    } catch (err) {
        console.error('Error al obtener las películas: ', err);
        res.status(500).send('Error al obtener las películas.');
    }
});

app.get('/movies/:id', async (req, res) => {
    const movieId = req.params.id;

    const params = {
        TableName: TABLE_NAME,
        Key: { movie_id: movieId },
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (!data.Item) {
            res.status(404).json({ message: 'Película no encontrada' });
        } else {
            res.status(200).json(data.Item);
        }
    } catch (err) {
        console.error('Error al obtener la película: ', err);
        res.status(500).send('Error al obtener la película.');
    }
});

app.patch('/movies/:id', async (req, res) => {
    const movieId = req.params.id;
    const updatedFields = req.body;

    const expressionParts = [];
    const expressionValues = {};
    const expressionNames = {};

    Object.keys(updatedFields).forEach((key, i) => {
        expressionParts.push(`#field${i} = :val${i}`);
        expressionNames[`#field${i}`] = key;
        expressionValues[`:val${i}`] = updatedFields[key];
    });

    const params = {
        TableName: TABLE_NAME,
        Key: { movie_id: movieId },
        UpdateExpression: 'SET ' + expressionParts.join(', '),
        ExpressionAttributeNames: expressionNames,
        ExpressionAttributeValues: expressionValues,
        ReturnValues: 'ALL_NEW',
    };

    try {
        const data = await dynamoDB.update(params).promise();
        res.status(200).json({ message: 'Película actualizada correctamente', movie: data.Attributes });
    } catch (err) {
        console.error('Error al actualizar la película: ', err);
        res.status(500).send('Error al actualizar la película.');
    }
});

app.delete('/movies/:id', async (req, res) => {
    const movieId = req.params.id;

    const params = {
        TableName: TABLE_NAME,
        Key: { movie_id: movieId },
        ReturnValues: 'ALL_OLD',
    };

    try {
        const data = await dynamoDB.delete(params).promise();
        if (!data.Attributes) {
            res.status(404).json({ message: 'Película no encontrada para eliminar' });
        } else {
            res.status(200).json({ message: 'Película eliminada correctamente' });
        }
    } catch (err) {
        console.error('Error al eliminar la película: ', err);
        res.status(500).send('Error al eliminar la película.');
    }
});

app.get('/health', (req, res) => {
    res.send('¡Hola, esta es mi Web API NoSQL!');
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
