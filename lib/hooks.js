const convertQueryOverrides = () => {
  return context => {
    const { query = {} } = context.params;
    if (typeof query.returnUri === 'string') query.returnUri = Boolean(JSON.parse(query.returnUri.toLowerCase()));
    if (typeof query.returnBuffer === 'string') query.returnBuffer = Boolean(JSON.parse(query.returnBuffer.toLowerCase()));
    return context;
  };
};

module.exports = {
  convertQueryOverrides
};
