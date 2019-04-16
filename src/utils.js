function selectFulfillmentMessages(
  result,
  type,
  source = "PLATFORM_UNSPECIFIED"
) {
  const fulfillmentMessages = result.fulfillmentMessages.filter(
    ({ message, platform }) => message === type && platform === source
  );

  return fulfillmentMessages;
}

function selectExampleMessage(messages, correspondingMessage) {
  if (messages.length === 0) {
    return undefined;
  }

  return !correspondingMessage && messages[0].text.text[0];
}

/**
 * As there are currently no ways to retrieve the platform from the query result
 * we consider a response from Actions On Google if one of the fulfillment messages
 * has a platform whose value is ACTIONS_ON_GOOGLE
 */
function isActionsOnGoogle(result) {
  return result.fulfillmentMessages.some(
    message => message.platform === "ACTIONS_ON_GOOGLE"
  );
}

module.exports = {
  selectFulfillmentMessages,
  selectExampleMessage,
  isActionsOnGoogle
};
