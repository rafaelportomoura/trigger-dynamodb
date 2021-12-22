const uuid = require('uuid');

class Handler {
  constructor({ dynamoDbSvc }) {
    this.dynamoDbSvc = dynamoDbSvc;
    this.dynamoDBTable = process.env.DYNAMODB_TABLE;
  }

  async insertItem(params) {
    return this.dynamoDbSvc.put(params).promise();
  }

  prepareData(data) {
    return {
      TableName: this.dynamoDBTable,
      Item: {
        ...data,
        id: uuid.v1(),
        createdAt: new Date().toISOString(),
      },
    };
  }
  handlerSuccess(data) {
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  }
  handlerError(data) {
    return {
      statusCode: data.statusCode || 501,
      headers: { 'Content-Type': 'text/plain' },
      body: data.message,
    };
  }

  async main(event) {
    try {
      const data = JSON.parse(event.body);
      const dbParams = this.prepareData(data);
      await this.insertItem(dbParams);
      return this.handlerSuccess(dbParams.Item);
    } catch (error) {
      console.log(JSON.stringify(error));
      return this.handlerError({
        statusCode: 500,
        message: `Message: ${error.message}\nStack: ${error.stack}`,
      });
    }
  }
}

//factory
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const handler = new Handler({
  dynamoDbSvc: dynamoDB,
});
module.exports = handler.main.bind(handler);
