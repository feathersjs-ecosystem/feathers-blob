const convertQueryOverrides = () => {
  return context => {
    const { query } = context.params;
    if (query && typeof query.returnUri === 'string') {
      query.returnUri = Boolean(JSON.parse(query.returnUri.toLowerCase()));
    }
    if (query && typeof query.returnBuffer === 'string') {
      query.returnBuffer = Boolean(JSON.parse(query.returnBuffer.toLowerCase()));
    }
    return context;
  };
};

module.exports = {
  convertQueryOverrides
};
