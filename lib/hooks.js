const convertQueryOverrides = () => {
  return context => {
    const { query } = context.params;
    if (query) {
      const { returnUri, returnBuffer } = query;
      if (typeof returnUri === 'string') query.returnUri = Boolean(JSON.parse(returnUri.toLowerCase()));
      if (typeof returnBuffer === 'string') query.returnBuffer = Boolean(JSON.parse(returnBuffer.toLowerCase()));
    }
    return context;
  };
};

module.exports = {
  convertQueryOverrides
};
