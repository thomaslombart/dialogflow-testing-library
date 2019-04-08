const {
  matcherHint,
  printReceived,
  printExpected
} = require("jest-matcher-utils");
const diff = require("jest-diff");
const isEqual = require("lodash.isequal");
const colors = require("colors");

const structjson = require("./structjson");

const matchers = {
  toHaveIntent(result, intent) {
    const query = result.queryText;
    const matchedIntent = result.intent.displayName;

    return {
      pass: matchedIntent === intent,
      message: () =>
        `${matcherHint(
          ".toHaveIntent"
        )}\n\nQuery: "${query}"\nExpected intent: ${printExpected(
          intent
        )}\nReceived intent: ${printReceived(
          matchedIntent
        )}.\n\nYou may want to check your ${
          "training phrases".bold
        }. For example make sure they are not ${
          "conflicting".bold
        } across your intents.`
    };
  },
  toHaveContext(result, expectedContext) {
    const receivedContext = result.outputContexts.find(context => {
      const contextName = context.name.split("contexts/")[1];
      return expectedContext.name === contextName;
    });

    if (!receivedContext) {
      return {
        pass: false,
        message: () =>
          `No context with name "${
            expectedContext.name.bold
          }" have been found in the output contexts. Make sure you provided one and that its name is ${
            "lowercased".bold
          }.`
      };
    }

    const formattedReceivedContext = {
      name: expectedContext.name,
      lifespanCount: receivedContext.lifespanCount,
      parameters: structjson.structProtoToJson(receivedContext.parameters)
    };

    return {
      pass: isEqual(formattedReceivedContext, expectedContext),
      message: () =>
        `The expected context is not the same as the received one.\n\nDifference:\n${diff(
          formattedReceivedContext,
          expectedContext
        )}`
    };
  },
  toHaveTextResult(result, expectedText) {
    const textMessages = result.fulfillmentMessages.filter(
      ({ message, platform }) =>
        message === "text" && platform === "PLATFORM_UNSPECIFIED"
    );

    const correspondingMessage = textMessages.find(({ text: { text } }) =>
      text[0].includes(expectedText)
    );

    const exampleMessage =
      !correspondingMessage &&
      textMessages.length !== 0 &&
      textMessages[0].text.text[0];

    if (!correspondingMessage) {
      return {
        pass: false,
        message: () =>
          `No such text message have been found in the fulfillment messages.\nMake sure that you're looking for ${
            "text only".bold
          } and not text in cards or custom payloads for example.${
            exampleMessage
              ? "\nHere is one of the text messages displayed:\n\n" +
                colors.blue(`"${exampleMessage}"`)
              : ""
          }`
      };
    }

    return {
      pass: true
    };
  },
  toHaveOneOfTextResults(result, expectedTextArray) {
    const textMessages = result.fulfillmentMessages.filter(
      ({ message, platform }) =>
        message === "text" && platform === "PLATFORM_UNSPECIFIED"
    );

    const correspondingMessage = textMessages.find(
      ({
        text: {
          text: [text]
        }
      }) => {
        return expectedTextArray.some(t => text.includes(t));
      }
    );

    const exampleMessage =
      !correspondingMessage &&
      textMessages.length !== 0 &&
      textMessages[0].text.text[0];

    if (!correspondingMessage) {
      return {
        pass: false,
        message: () =>
          `No such text message have been found in the fulfillment messages.\nMake sure that you're looking for ${
            "text only".bold
          } and not text in cards or custom payloads for example.${
            exampleMessage
              ? "\nHere is one of the text messages displayed:\n\n" +
                colors.blue(`"${exampleMessage}"`)
              : ""
          }`
      };
    }

    return {
      pass: true
    };
  },
  toHaveQuickReplies(result, expectedQuickReplies) {
    const quickRepliesArray = result.fulfillmentMessages.filter(
      ({ message, platform }) =>
        message === "quickReplies" && platform === "PLATFORM_UNSPECIFIED"
    );

    if (quickRepliesArray.length === 0) {
      return {
        pass: false,
        message: () => colors.red("There are no quick replies in the response.")
      };
    }

    const quickReplies = quickRepliesArray[0].quickReplies.quickReplies;

    return {
      pass: isEqual(quickReplies, expectedQuickReplies),
      message: () =>
        `The expected quick replies are different from the received ones:\n\n${diff(
          quickReplies,
          expectedQuickReplies
        )}.\n\nMake sure you provided the quick replies ${colors.bold(
          "in the right order."
        )}`
    };
  }
};

module.exports = matchers;
