const convertQueryOverrides = () => {
  return context => {
    const { query = {} } = context.params;
    const convertQueryParam = key => {
      if (typeof query[key] === 'string') query[key] = Boolean(JSON.parse(query[key].toLowerCase()));
    };
    convertQueryParam('returnUri');
    convertQueryParam('returnBuffer');
    return context;
  };
};

module.exports = {
  convertQueryOverrides
};
