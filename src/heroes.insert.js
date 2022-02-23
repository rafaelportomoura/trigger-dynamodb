const uuid = require('uuid');
const Joi = require('@hapi/joi');
const decoratorValidator = require('./utils/decoratorValidator');
const globalEnumParams = require('./utils/globalEnumParams');
class Handler {
  constructor({ dynamoDbSvc }) {
    this.dynamoDbSvc = dynamoDbSvc;
    this.dynamoDBTable = process.env.DYNAMODB_TABLE;
  }

  static validator() {
    return Joi.object({
      nome: Joi.string().max(100).min(2).required(),
      poder: Joi.string().max(20).required(),
    });
  }

  async insertItem(params) {
    return this.dynamoDbSvc.put(params).promise();
  }

  prepareData(data) {
    const params = {
      TableName: this.dynamoDBTable,
      Item: {
        ...data,
        id: uuid.v1(),
        createdAt: new Date().toISOString(),
      },
    };

    return params;
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
      const data = JSON.parse(event);

      const dbParams = this.prepareData(value);
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
module.exports = decoratorValidator(
  handler.main.bind(handler),
  Handler.validator,
  'globalEnumParams'
);
