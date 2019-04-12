const colors = require("colors");
const diff = require("jest-diff");
const { printReceived, printExpected } = require("jest-matcher-utils");

describe("Testing matchers", () => {
  test("toHaveIntent", () => {
    const result = {
      queryText: "find me activities",
      intent: {
        displayName: "activities"
      }
    };

    expect(result).toHaveIntent("activities");
    expect(() => expect(result).toHaveIntent("test")).toThrowError(
      `Query: "find me activities"\nExpected intent: ${printExpected(
        "test"
      )}\nReceived intent: ${printReceived(
        "activities"
      )}.\n\nYou may want to check your ${
        "training phrases".bold
      }. Make sure they are not ${"conflicting".bold} across your intents.`
    );
  });

  test("toHaveContext", () => {
    const result = {
      outputContexts: [
        {
          name: "projects/project-id/agent/sessions/some-id/contexts/city",
          lifespanCount: 2,
          // parameters is in the Struct format
          parameters: {
            fields: {
              currentCity: {
                stringValue: "London",
                kind: "stringValue"
              }
            }
          }
        }
      ]
    };

    expect(result).toHaveContext({
      name: "city",
      lifespanCount: 2,
      parameters: { currentCity: "London" }
    });

    expect(() => expect(result).toHaveContext({})).toThrowError(
      "You didn't give a context\nRefer to these docs for the format: https://cloud.google.com/dialogflow-enterprise/docs/reference/rest/v2/projects.agent.sessions.contexts#Context."
    );
    expect(() => expect(result).toHaveContext({ name: "test" })).toThrowError(
      `No context with name "${colors.bold(
        "test"
      )}" have been found in the output contexts. Make sure you provided one and that its name is ${colors.bold(
        "lowercased"
      )}.`
    );

    expect(() =>
      expect(result).toHaveContext({
        name: "city",
        lifespanCount: 3,
        parameters: { currentCity: "Paris" }
      })
    ).toThrowError(
      `The expected context is not the same as the received one.\n\nDifference:\n${diff(
        {
          name: "city",
          lifespanCount: 2,
          parameters: { currentCity: "London" }
        },
        {
          name: "city",
          lifespanCount: 3,
          parameters: { currentCity: "Paris" }
        }
      )}`
    );
  });

  test("toHaveCard", () => {
    const receivedCard = {
      buttons: [
        {
          text: "Learn more about yellow",
          postback: "https://myappaboutcolors.dev/yellow"
        }
      ],
      title: "Yellow",
      subtitle: "Color between orange and red",
      imageUri: "https://myappaboutcolors.dev/yellow.jpg"
    };

    const result = {
      fulfillmentMessages: [
        {
          platform: "PLATFORM_UNSPECIFIED",
          text: { text: ["Here is what I found about Yellow."] },
          message: "text"
        },
        {
          platform: "PLATFORM_UNSPECIFIED",
          card: receivedCard,
          message: "card"
        }
      ]
    };

    expect(result).toHaveCard(receivedCard);
    expect(() => expect(result).toHaveCard({})).toThrowError(
      `The expected card is different from the received one:\n\n${diff(
        receivedCard,
        {}
      )}.`
    );

    const resultWithNoCards = {
      fulfillmentMessages: [
        {
          platform: "PLATFORM_UNSPECIFIED",
          text: { text: ["Here is what I found about Yellow."] },
          message: "text"
        }
      ]
    };

    expect(() =>
      expect(resultWithNoCards).toHaveCard(receivedCard)
    ).toThrowError("There are no cards in the response.");
  });
});
