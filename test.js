var stripe = require("stripe")(
  "sk_test_lz1hrILHF8cpRcmec4jKOpzS"
);

var createToken = (cb) => {
  stripe.tokens.create({
    card: {
      "number": '4242424242424242',
      "exp_month": 12,
      "exp_year": 2019,
      "cvc": '123'
    }
  }, cb);
}

var createCustomer = (tokenId, cb) => {
  stripe.customers.create({
    description: 'Customer for charlotte.johnson@example.com',
    source: tokenId // obtained with Stripe.js
  }, cb);
}

var destinationCharge = (customerId, accountId, cb) => {
  stripe.charges.create({
    amount: 1000,
    currency: "sgd",
    customer: customerId,
    destination: {
      account: accountId,
    },
    metadata: {
      condo: "Bao's Condo",
      unit: "12A8",
      type: "booking"
    }
  }, cb);
}

createToken((err, token) => {
  if (err) {
    console.log(err);
  } else {
    createCustomer(token.id, (err, customer) => {
      if (err) {
        console.log(err);
      } else {
        destinationCharge(customer.id, "acct_1CPL8SCIgmWGKykK", (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
          }
        });
      }
    });
  }
})