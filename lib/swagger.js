const fs = require('fs');
const https = require('https');
const error = require('debug')('error');
const log = require('debug')('log');
const { URL } = require('url');

const fetchSwagger = (done, swaggerPath) => {
  const swagger = (swaggerPath || process.env.SWAGGER || '../account-info-api-spec/dist/account-info-swagger.yaml');
  if (swagger.startsWith('https')) {
    log(`http get: ${swagger}`);
    const file = './swagger.yaml';
    fs.writeFileSync(file, '');

    const options = new URL(swagger);

    https.get(options, (res) => {
      const { statusCode } = res;
      log(`statusCode: ${statusCode}`);
      if (statusCode === 200) {
        res.on('data', yaml => fs.appendFileSync(file, yaml));
        res.on('end', () => done(file));
      } else if (!swaggerPath && process.env.SWAGGER_FALLBACK) {
        fetchSwagger(done, process.env.SWAGGER_FALLBACK);
      } else {
        const msg = `Swagger file ${swagger} not retrieved: ${statusCode}`;
        error(msg);
        throw new Error(msg);
      }
    }).on('error', (err) => {
      const msg = `Swagger file ${swagger} not retrieved: ${err}`;
      error(msg);
      throw new Error(msg);
    });
  } else if (swagger.endsWith('.yaml') && fs.existsSync(swagger)) {
    done(swagger);
  } else {
    const err = `Swagger file ${swagger} does not exist`;
    error(err);
    throw new Error(err);
  }
};

exports.fetchSwagger = fetchSwagger;