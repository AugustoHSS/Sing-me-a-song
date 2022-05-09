import supertest from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/database.js";

async function disconnectPrisma() {
  await prisma.$disconnect();
}

async function truncateAllTables() {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
}


describe("POST /recommendations", () => {
  beforeEach(truncateAllTables);
  afterAll(disconnectPrisma);

  it("return 201 when send a valid body", async () => {
    const recommendation = {
      name: "Imagine Dragons - Bones",
      youtubeLink: "https://www.youtube.com/watch?v=DYed5whEf4g",
    };

    const response = await supertest(app)
      .post("/recommendations").send(recommendation);
    expect(response.status).toEqual(201);
  });

  it("return 422 when send an invalid body", async () => {
    const recommendation = {};

    const response = await supertest(app)
      .post("/recommendations").send(recommendation);
    expect(response.status).toEqual(422);
  });
});


describe("POST /recommendations/:id/upvote", () => {
  beforeEach(truncateAllTables);
  afterAll(disconnectPrisma);

  it("return 200 when send a valid recommendation id and increment score by one", async () => {
    const recommendation = await prisma.recommendation.create({
      data: {
        name: "Imagine Dragons - Bones",
        youtubeLink: "https://www.youtube.com/watch?v=DYed5whEf4g",
      }
    });

    const response = await supertest(app).post(`/recommendations/${recommendation.id}/upvote`);

    const afterUpVote = await prisma.recommendation.findUnique({
      where: {
        id: recommendation.id
      }
    });

    expect(response.status).toEqual(200);
    expect(afterUpVote.score).toEqual(1);
  });
});


describe("POST /recommendations/:id/downvote", () => {
  beforeEach(truncateAllTables);
  afterAll(disconnectPrisma);

  it("return 200 when send a valid recommendation id and decrement score by one", async () => {
    const recommendation = await prisma.recommendation.create({
      data: {
        name: "Imagine Dragons - Bones",
        youtubeLink: "https://www.youtube.com/watch?v=DYed5whEf4g",
      }
    });

    const response = await supertest(app).post(`/recommendations/${recommendation.id}/downvote`);

    const afterDownVote = await prisma.recommendation.findUnique({
      where: {
        id: recommendation.id
      }
    });

    expect(response.status).toEqual(200);
    expect(afterDownVote.score).toEqual(-1);
  });
});


describe("GET /recommendations", () => {
  beforeEach(truncateAllTables);
  afterAll(disconnectPrisma);


  it("return 200 when app returns a recommendations array", async () => {
    await prisma.recommendation.create({
      data: {
        name: "Imagine Dragons - Bones",
        youtubeLink: "https://www.youtube.com/watch?v=DYed5whEf4g",
      }
    });

    const response = await supertest(app).get("/recommendations");

    expect(response.status).toEqual(200);
    expect(response.body.length).toBeGreaterThan(0);
  });
});


describe("GET /recommendations/:id", () => {
  beforeEach(truncateAllTables);
  afterAll(disconnectPrisma);

  it('return a recommendation when send an id', async () => {
    await prisma.recommendation.createMany({
      data: [
        {
          name: "Imagine Dragons - Bones",
          youtubeLink: "https://www.youtube.com/watch?v=DYed5whEf4g",
        },
        {
          name: "Justin Bieber - Peaches",
          youtubeLink: "https://www.youtube.com/watch?v=tQ0yjYUFKAE",
        }
      ]
    });

    const findOne = await prisma.recommendation.findFirst();

    const response = await supertest(app).get(`/recommendations/${findOne.id}`);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(findOne);
  });

});


describe("GET /recommendations/random", () => {
  beforeEach(truncateAllTables);
  afterAll(disconnectPrisma);

  it("return 200 and a random music object", async () => {
    const recommendations = await prisma.recommendation.create({
      data: {
        name: "Imagine Dragons - Bones",
        youtubeLink: "https://www.youtube.com/watch?v=DYed5whEf4g",
      }
    });

    const response = await supertest(app).get("/recommendations/random");

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(recommendations);
  });
});


describe("GET /recommendations/top/:amount", () => {
  beforeEach(truncateAllTables);
  afterAll(disconnectPrisma);


  it("return 200 and the number of musics chosen", async () => {
    await prisma.recommendation.createMany({
      data: [
        {
          name: "Imagine Dragons - Bones",
          youtubeLink: "https://www.youtube.com/watch?v=DYed5whEf4g",
        },
        {
          name: "Justin Bieber - Peaches",
          youtubeLink: "https://www.youtube.com/watch?v=tQ0yjYUFKAE",
        },
        {
          name: "The Weeknd - Save Your Tears",
          youtubeLink: "https://www.youtube.com/watch?v=XXYlFuWEuKI",
        }
      ]
    });

    const response = await supertest(app).get(`/recommendations/top/2`);

    expect(response.body.length).toEqual(2);
  });

});