const decoratorValidator = (fn, schema, argsType) => {
  return async function (event) {
    const data = JSON.parse(event[argsType]);
    const { error, value } = schema.validate(data, { abortEarly: true });

    event[argsType] = value;

    if (!error) {
      // arguments serve para pegar todos os argumentos que vieram na função
      // neste caso é o event
      return fn.apply(this, arguments);
    }

    return {
      statusCode: 422,
      body: error.message,
    };
  };
};

module.exports = decoratorValidator;
