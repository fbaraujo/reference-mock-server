const uuidv4 = require('uuid/v4');
const { accountRequestHelper } = require('./account-request.js');

const postPaymentsResponse = (request, paymentId, status) => ({
  Data: {
    PaymentId: paymentId,
    Status: status,
    CreationDateTime: `${(new Date()).toISOString().slice(0, -5)}+00:00`,
    Initiation: request.Data.Initiation,
  },
  Risk: request.Data.Risk,
  Links: {
    Self: `/open-banking/v1.1/payments/${paymentId}`,
  },
  Meta: {},
});

const post = (req, res) => {
  const authorization = req.headers['authorization']; // eslint-disable-line
  const authorized = accountRequestHelper.checkAuthorization({ authorization });
  if (!authorized) {
    return res.sendStatus(401);
  }
  const interactionId = req.headers['x-fapi-interaction-id'];
  const paymentId = uuidv4();
  const responsePayload = postPaymentsResponse(req.body, paymentId, 'AcceptedTechnicalValidation');
  const response = res.status(201).header('Content-Type', 'application/json');
  if (interactionId) {
    response.header('x-fapi-interaction-id', interactionId);
  }
  return response.json(responsePayload);
};

const paymentsMiddleware = (req, res, next) => {
  if (req.path.indexOf('/open-banking/v1.1/payments') === -1) {
    return next();
  }
  switch (req.method) {
    case 'POST':
      return post(req, res);
    default:
      return res.sendStatus(400);
  }
};

exports.postPaymentsResponse = postPaymentsResponse;
exports.paymentsMiddleware = paymentsMiddleware;