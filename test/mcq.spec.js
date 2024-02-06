// 'use strict';
// var __awaiter =
//   (this && this.__awaiter) ||
//   function (thisArg, _arguments, P, generator) {
//     function adopt(value) {
//       return value instanceof P
//         ? value
//         : new P(function (resolve) {
//             resolve(value);
//           });
//     }
//     return new (P || (P = Promise))(function (resolve, reject) {
//       function fulfilled(value) {
//         try {
//           step(generator.next(value));
//         } catch (e) {
//           reject(e);
//         }
//       }
//       function rejected(value) {
//         try {
//           step(generator['throw'](value));
//         } catch (e) {
//           reject(e);
//         }
//       }
//       function step(result) {
//         result.done
//           ? resolve(result.value)
//           : adopt(result.value).then(fulfilled, rejected);
//       }
//       step((generator = generator.apply(thisArg, _arguments || [])).next());
//     });
//   };
// var __importDefault =
//   (this && this.__importDefault) ||
//   function (mod) {
//     return mod && mod.__esModule ? mod : { default: mod };
//   };
// Object.defineProperty(exports, '__esModule', { value: true });
// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const chai_1 = require('chai');
// // const assert = require("assert");
// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const axios_1 = __importDefault(require('axios'));
// // const axios = require("axios");
// describe('api testing', function () {
//   describe('http://localhost:3000/api/', function () {
//     this.timeout(600 * 1000);
//     it("route('/') result should be type of string", function () {
//       // axios_1.default.get('http://192.168.18.85:3000/').then((res) => {
//       axios_1.default.get('http://localhost:3000/api/').then((res) => {
//         // assert.equal(typeof res.data, "string");
//         (0, chai_1.expect)(typeof res.data).equal('string');
//         (0, chai_1.expect)(res.data).to.be.string('App is up and Running');
//       });
//     });
//   });

//   describe('Company', function () {
//     it("route('/api/companies') should contian 2 keys only", function () {
//       return __awaiter(this, void 0, void 0, function* () {
//         axios_1.default
//           // .get('http://192.168.18.85:3000/api/companies')
//           .get('http://localhost:3000/api/companies')
//           .then((res) => {
//             (0, chai_1.expect)(res.status).to.be.eql(200);
//           });
//         // expect(typeof data).equal(typeof Root);
//         // assert.equal(typeof data === typeof Root, true);
//       });
//     });
//   });
// });
// //# sourceMappingURL=test.spec.js.map

// 'use strict';

// Object.defineProperty(exports, '__esModule', { value: true });
// const chai_1 = require('chai');
// require('mocha');

// import { mcqController } from '../src/mcq/mcq.controller';

// describe('McqController', () => {
//   let mcqController: { create: () => any };

//   before(async () => {
//     mcqController = await mcqController.create();
//   });

//   //   after(async () => {
//   //     await app.close();
//   //   });

//   it('should create MCQs successfully', async () => {
//     const mcqArray = {
//       mcqs: [
//         {
//           title: 'Sample MCQ Question',
//           questionType: 'private', // It might be overridden based on user type
//           question: 'description',
//           options: ['Option A', 'Option B', 'Option C', 'Option D'],
//           correctOption: 'Option A',
//           difficultyLevel: 'easy',
//           language: 'JavaScript',
//           tag: '652194b0b14d13342cb3c77e',
//         },
//       ],
//     };

//     // Send a POST request to the create-mcqs endpoint
//     const response = await request(app.getHttpServer())
//       .post('/api/create-mcqs')
//       .send(mcqArray);

//     // Check the response status and structure
//     expect(response.status).to.equal(201);
//     expect(response.body)
//       .to.have.property('message')
//       .to.equal('Mcqs Created Successfully');
//   });
// });
