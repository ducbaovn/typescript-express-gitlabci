/**
 * Created by kiettv on 12/16/16.
 */
import "mocha";
import * as chai from "chai";
const chaiHttp = require("chai-http");

import {Application} from "../src/app";
process.env.NODE_ENV = "testing";
chai.use(chaiHttp);
const expect = chai.expect;
const app = chai.request(new Application().getExpressInstance());
describe("Route", () => {
    it("Should be json", () => {
        app.get("/ping")
            .then(res => {
                expect(res.type).to.eql("application/json");
            });
    });

    it("Should response Not Found", () => {
        app.get("/")
            .then(res => {
                expect(res.status).eq(400);
            });
    });
});
