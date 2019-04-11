const dialogflow = require("dialogflow");
const uuid = require("uuid");

const matchers = require("./src/matchers");

expect.extend(matchers);

function generateSession(projectId) {
  const sessionId = uuid.v4();

  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  return [sessionClient, sessionPath];
}

async function request(text, languageCode, [sessionClient, sessionPath]) {
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text,
        languageCode
      }
    }
  };

  const responses = await sessionClient.detectIntent(request);

  return responses[0].queryResult;
}

function createBot(projectId, languageCode = "en") {
  const session = generateSession(projectId);

  return {
    request: async function(text) {
      const response = await request(text, languageCode, session);
      return response;
    },
    newSession: function() {
      return createBot(projectId, languageCode);
    }
  };
}

module.exports = createBot;
