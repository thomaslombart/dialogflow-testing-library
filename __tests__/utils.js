const {
  selectFulfillmentMessages,
  selectExampleMessage
} = require("../src/utils");

describe("utils", () => {
  describe("selectFulfillmentMessages", () => {
    const result = {
      fulfillmentMessages: [
        {
          platform: "PLATFORM_UNSPECIFIED",
          text: {},
          message: "text"
        },
        {
          platform: "PLATFORM_UNSPECIFIED",
          card: {},
          message: "card"
        }
      ]
    };

    test("It returns an empty array if there are no corresponding fulfillment messages", () => {
      const messages = selectFulfillmentMessages(
        result,
        "quickReplies",
        "PLATFORM_UNSPECIFIED"
      );

      expect(messages).toEqual([]);
    });

    test("It filters the type of the fulfillment messages", () => {
      const messages = selectFulfillmentMessages(
        result,
        "text",
        "PLATFORM_UNSPECIFIED"
      );

      expect(messages).toEqual([result.fulfillmentMessages[0]]);
    });
  });

  describe("selectExampleMessage", () => {
    test("It returns the first example message from the fulfillment messages", () => {
      const messages = [
        {
          platform: "PLATFORM_UNSPECIFIED",
          text: { text: ["Here is what I found about yellow."] },
          message: "text"
        },
        {
          platform: "PLATFORM_UNSPECIFIED",
          text: { text: ["Want to learn more?"] },
          message: "text"
        }
      ];

      expect(selectExampleMessage(messages, undefined)).toBe(
        "Here is what I found about yellow."
      );
    });

    test("It returns undefined if there are no text fulfillment messages ", () => {
      expect(selectExampleMessage([], undefined)).toBe(undefined);
    });
  });
});
