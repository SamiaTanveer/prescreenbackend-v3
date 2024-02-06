// type Root = {
//   companies: Company[];
//   total: number;
// };

// export interface Company {
//   logo: Logo;
//   banner: Banner;
//   name: string;
//   email: string;
//   industry: string;
//   phone: string;
//   website: string;
//   linkedin: string;
//   description: string;
//   content: string;
//   foundedDate: string;
//   address: string;
//   city: string;
//   country: string;
// }

// export interface Logo {
//   url: string;
//   path: string;
//   originalname: string;
// }

// export interface Banner {
//   url: string;
//   path: string;
//   originalname: string;
// }
import { expect } from 'chai';
// const assert = require("assert");
import axios from 'axios';

// const axios = require("axios");
describe('api testing', function () {
  describe('http://localhost:3000/', function () {
    this.timeout(600 * 1000);
    it("route('/') result should be type of string", async function () {
      await axios.get('http://localhost:3000/').then((res): void => {
        // assert.equal(typeof res.data, "string");
        // expect(typeof res.data).equal('string');
        // console.log(res.data);
        // expect(res.data).to.be.string('App is up and Running');
        expect(res.data).to.be.string('App is up and Running');
      });
    });
  });
});
