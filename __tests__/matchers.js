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
          text: { text: ["Here is what I found about yellow."] },
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
          text: { text: ["Here is what I found about yellow."] },
          message: "text"
        }
      ]
    };

    // expect(() =>
    //   expect(resultWithNoCards).toHaveCard(receivedCard)
    // ).toThrowError("There are no cards in the response.");
  });

  test("toHaveText", () => {
    const result = {
      fulfillmentMessages: [
        {
          platform: "PLATFORM_UNSPECIFIED",
          text: { text: ["Here is what I found about yellow."] },
          message: "text"
        },
        {
          platform: "PLATFORM_UNSPECIFIED",
          card: {},
          message: "card"
        }
      ]
    };

    expect(result).toHaveText("Here is what I found about yellow.");
    expect(() =>
      expect(result).toHaveText("Here is what I found about pink.")
    ).toThrowError(
      `No such text message have been found in the fulfillment messages.\nMake sure that you're looking for ${
        "text only".bold
      } and not text in cards or custom payloads for example.${"\nHere is one of the text messages displayed:\n\n" +
        colors.blue(`"${result.fulfillmentMessages[0].text.text[0]}"`)}`
    );
  });

  test("toHaveOneOfTexts", () => {
    const result = {
      fulfillmentMessages: [
        {
          platform: "PLATFORM_UNSPECIFIED",
          text: { text: ["Here is what I found about yellow."] },
          message: "text"
        },
        {
          platform: "PLATFORM_UNSPECIFIED",
          card: {},
          message: "card"
        }
      ]
    };

    expect(result).toHaveOneOfTexts([
      "Do you want to learn more about yellow?",
      "Here is what I found about yellow.",
      "Me too. Want to learn more about yellow ?"
    ]);
    expect(() =>
      expect(result).toHaveOneOfTexts([
        "Do you want to learn more about yellow?",
        "Here is what I found about pink.",
        "Me too. Want to learn more about yellow ?"
      ])
    ).toThrowError(
      `No such text message have been found in the fulfillment messages.\nMake sure that you're looking for ${
        "text only".bold
      } and not text in cards or custom payloads for example.${"\nHere is one of the text messages displayed:\n\n" +
        colors.blue(`"${result.fulfillmentMessages[0].text.text[0]}"`)}`
    );
  });

  test("toHaveQuickReplies", () => {
    const quickReplies = ["Another one", "Learn more", "Share it"];

    const result = {
      fulfillmentMessages: [
        {
          platform: "PLATFORM_UNSPECIFIED",
          text: { text: ["Here is a random color."] },
          message: "text"
        },
        {
          platform: "PLATFORM_UNSPECIFIED",
          quickReplies: {
            quickReplies,
            title: ""
          },
          message: "quickReplies"
        }
      ]
    };

    expect(result).toHaveQuickReplies(quickReplies);
    expect(() =>
      expect(result).toHaveQuickReplies(["Yellow", "green", "red"])
    ).toThrowError(
      `The expected quick replies are different from the received ones:\n\n${diff(
        quickReplies,
        ["Yellow", "green", "red"]
      )}.\n\nMake sure you provided the quick replies ${colors.bold(
        "in the right order."
      )}`
    );
    expect(() =>
      expect(result).toHaveQuickReplies([
        "Another one",
        "Share it",
        "Learn more"
      ])
    ).toThrowError(
      `The expected quick replies are different from the received ones:\n\n${diff(
        quickReplies,
        ["Another one", "Share it", "Learn more"]
      )}.\n\nMake sure you provided the quick replies ${colors.bold(
        "in the right order."
      )}`
    );
  });
});
