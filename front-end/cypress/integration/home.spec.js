/// <reference types="cypress" />

describe("Home page tests", () => {
  beforeEach(() => {
    cy.resetDatabase();
  });

  const recommendation = {
    name: "Alan Walker - Faded",
    youtubeLink: "https://www.youtube.com/watch?v=60ItHLz5WEA",
    score: 30
  };

  it("create a recommendation", () => {

    cy.visit("http://localhost:3000/");
    cy.get('input').first().type(recommendation.name)
    cy.get('input').last().type(recommendation.youtubeLink)
    cy.get('button').click()

    cy.contains(recommendation.name)

    cy.end()
  });

  it("show an alert when send a invalid recommendation", () => {

    cy.visit("http://localhost:3000/");
    cy.get("button").click();

    cy.on("window:alert", (text) => {
      expect(text).to.contains("Error creating recommendation!");
    });
    cy.end();
  });

  it("increase and decrease recommendation score", () => {

    cy.seed()
    cy.visit("http://localhost:3000/");

    cy.get('article').first().find('svg').first().click();
    cy.contains(2);
    cy.get('article').first().find('svg').last().click();
    cy.contains(1);
    cy.end();

  });

  it("exclude the recommendation decreasing 5 times", () => {
    cy.visit("http://localhost:3000/");
    cy.get('input').first().type(recommendation.name)
    cy.get('input').last().type(recommendation.youtubeLink)
    cy.get('button').click()

    cy.get('article').first().find('svg').last().click();
    cy.get('article').first().find('svg').last().click();
    cy.get('article').first().find('svg').last().click();
    cy.get('article').first().find('svg').last().click();
    cy.get('article').first().find('svg').last().click();
    cy.get('article').first().find('svg').last().click();

    cy.contains("No recommendations yet! Create your own :)");

    cy.end();
  });

  it("return random music", () => {
    cy.visit("http://localhost:3000/");

    cy.get('input').first().type(recommendation.name)
    cy.get('input').last().type(recommendation.youtubeLink)
    cy.intercept("POST", "http://localhost:5000/recommendations").as("create")
    cy.get('button').click()
    cy.wait("@create")
    cy.contains("Random").click();

    cy.url().should("equal", "http://localhost:3000/random");
    cy.contains(recommendation.name)
    cy.end();
  });

  it("return recommendations top", () => {
    cy.seed()
    cy.visit("http://localhost:3000/");

    cy.contains("Top").click();
    cy.url().should("equal", "http://localhost:3000/top");

    cy.get('article').first().contains(6)
    cy.end();
  });

});

