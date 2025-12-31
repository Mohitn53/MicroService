process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongo;

beforeAll(async () => {
  jest.setTimeout(20000);

  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  process.env.MONGO_URI = uri;

  await mongoose.connect(uri, {
    dbName: "jest",
  });
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) return;

  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  if (mongo) {
    await mongo.stop();
  }
});
