
const request = require("supertest");
const app = require("../server");

test("GET / returns status 200", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
});
