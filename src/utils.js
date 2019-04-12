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

module.exports = { selectFulfillmentMessages, selectExampleMessage };
