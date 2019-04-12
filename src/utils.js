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
  return (
    !correspondingMessage && messages.length !== 0 && messages[0].text.text[0]
  );
}

module.exports = { selectFulfillmentMessages, selectExampleMessage };
