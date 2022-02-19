import * as _chai from "chai";

import Category, { CategoryType } from "../src/type/Category";

_chai.should();

let server: Express;
const ddbMock = mockClient(DynamoDBDocumentClient);

describe("Categories usage suite", () => {
  before(() => {
    server = createServer();
    ddbMock.reset();
  });

  it("create - regular creation should not fail", (done) => {
    ddbMock.on(PutCommand).resolves({
      $metadata: { httpStatusCode: 200 },
    });

    const category = {
      name: "Test 1",
      type: CategoryType.EXPENSE,
    } as Category;

    console.log("calling server");

    request(server)
      .post("/api/categories")
      .send(category)
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        const body = res.body;
        _chai.expect(body.name).equal(category.name);
        _chai.expect(body.type).equal(category.type);
        _chai.expect(body.id).to.not.be.empty;
        _chai.expect(body.accountId).to.not.be.empty;
        _chai.expect(body.creationDate).to.not.be.empty;
        _chai.expect(body.modificationDate).to.not.be.empty;
        done();
      });
  });

  it("create - empty type should fail", (done) => {
    //Guaranteeing that tests won't reach the DB
    ddbMock.on(PutCommand).rejects({
      $metadata: { httpStatusCode: 400 },
    });

    const category = {
      name: "Test 1",
    } as Category;

    console.log("calling server");

    request(server).post("/api/categories").send(category).expect(400, done);
  });
});
