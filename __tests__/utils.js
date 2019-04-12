const { selectFulfillmentMessages } = require("../src/utils");

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
});
