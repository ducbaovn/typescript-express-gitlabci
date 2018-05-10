var braintree = require("braintree");
var sdk = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: 'gmjnhy37tvd89w7q',
  publicKey: 'prpn3zn4jyvqt78d',
  privateKey: '7fbac9f902f39cd60d8b2d1752f48594'
});

sdk.customer.create({
  // cardholderName: "Ho Anh Truc",
  // expirationDate: "06/2020",
  // number: "4111111111111111",
}, function (err, result) {
  console.log('err: ', err);
  console.log('customer: ', result.customer.id);
});

// sdk.paymentMethod.create({
//   customerId: '841135653',
//   paymentMethodNonce: "ccd42e60-499b-0391-62af-b8cc7fde3c62",
// }, function (err, result) {
//   console.log('err: ', err);
//   console.log('customer: ', result);
// });

// sdk.customer.find('841135653', function (err, result) {
//   console.log('err: ', err);
//   console.log('customer: ', result);
// })

// sdk.transaction.sale({
//   amount: "10.00",
//   customerId: '841135653',
//   options: {
//     submitForSettlement: true
//   }
// }, function (err, result) {
//   console.log('err: ', err);
//   console.log(result);
// })

// sdk.clientToken.generate({}, function (err, response) {
//   var clientToken = response.clientToken;
//   console.log(clientToken);
// });
// var crypto = require("crypto");
// var path = require("path");
// var fs = require("fs");

// var relativeOrAbsolutePathToPublicKey = path.join(__dirname, "src", "configs", "server.pub");
// var absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
// var publicKey = fs.readFileSync(absolutePath, "utf8");
// var key = {};
// key["key"] = publicKey;
// key["padding"] = crypto.constants.RSA_PKCS1_PADDING;
// var buffer = new Buffer("7fbac9f902f39cd60d8b2d1752f48594");
// var encrypted = crypto.publicEncrypt(key, buffer);
// console.log(encrypted.toString("base64"));