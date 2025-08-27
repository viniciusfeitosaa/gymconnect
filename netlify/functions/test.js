exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Teste funcionando!',
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      path: event.path
    })
  };
};
