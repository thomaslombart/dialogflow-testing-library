const dialogflow = require("dialogflow");
const uuid = require("uuid");

const matchers = require("./src/matchers");
const structjson = require("./src/structjson");

expect.extend(matchers);

function generateSession(projectId) {
  const sessionId = uuid.v4();

  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  return [sessionClient, sessionPath];
}

async function request(
  text,
  source,
  languageCode,
  [sessionClient, sessionPath]
) {
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text,
        languageCode
      }
    },
    queryParams: {
      payload: structjson.jsonToStructProto({
        source
      })
    }
  };

  const responses = await sessionClient.detectIntent(request);

  return responses[0].queryResult;
}

function createBot(projectId, source = "DEFAULT", languageCode = "en") {
  const session = generateSession(projectId);

  return {
    request: async function(text) {
      const response = await request(text, source, languageCode, session);
      return response;
    },
    newSession: function() {
      return createBot(projectId, source, languageCode);
    }
  };
}

module.exports = createBot;
