# Dialogflow testing library

This library leverages the power of [Jest matchers](https://jestjs.io/docs/en/using-matchers) and the [Node.js client for Dialogflow](https://github.com/googleapis/nodejs-dialogflow) to make testing your bot an easy task.

## Table of Contents

- [Example](#example)
- [Install](#install)
- [Setup](#setup)
- [API](#api)
- [Custom matchers](#custom-matchers)
- [Roadmap](#roadmap)

## Example

Assuming you have a Dialogflow bot, this is how you could make use of the testing library for your bot:

```js
const createBot = require("dialogflow-testing-library");

describe("Testing bot", () => {
  let bot;
  beforeEach(() => {
    bot = createBot("my-bot-id");
  });

  test("A sentence match the right intent", async () => {
    const { request } = bot;
    const result = await request("Hey");
    expect(result).toHaveIntent("favorite color");
  });

  test("The user chooses its favorite color", async () => {
    const { request } = bot;
    const colorsResult = await request("I want to hear about colors");
    expect(colorsResult).toHaveTextResult(
      "Which color, indigo taco, pink unicorn or blue grey coffee?"
    );
    const selectedColorResult = await request("blue grey coffee");
    expect(selectedColorResult).toHaveTextResult("Here's the color.");
  });

  test("It returns a question if talk about our favorite color", async () => {
    const { request } = bot;
    const result = await request("Pick a random color");

    expect(result).toHaveQuickReplies([
      "Another one",
      "Learn more",
      "Share it"
    ]);
  });
});
```

## Install

```js
npm install --save-dev dialogflow-testing-library
```

## Setup

In order to test the Dialogflow bot properly, you will need to authenticate yourself. It implies to create a service account and grab a private key.

### Getting the key

1. Under the **GOOGLE PROJECT** section, click on the name of the **Service Account** to go to the Google cloud platform.
2. On the Google Cloud Platform, click on **IAM & admin** then on **Service accounts**.
3. Click on **CREATE SERVICE ACCOUNT**, fill in the name of your service account and click on **CREATE**.
4. Select a Dialoflow role. For our purposes, a client role will be enough (**Dialogflow > Dialogflow API Client**). Click on **CONTINUE** once the role is selected.
5. Click on **CREATE KEY** and select the **JSON** type.
6. Download the file and save it to the location you want.

### Using the key

You need to install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/) beforehand.

Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the file path of the JSON file that contains your service account key. For use in future shell sessions, you should save this setting in an initialization file or system setting, such as in a `.bashrc` or `.bash_profile` file.

**Note**: if you have multiple bots, set the `GOOGLE_APPLICATION_CREDENTIALS` to the file path of the JSON file in one of your `package.json` scripts. For example:

```json
{
  "scripts": {
    "test": "GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/file/key.json jest"
  }
}
```

## API

Beforehand, you have to create the bot that will allows you to make requests.

### `createBot(projectId, languageCode)`

This function will enable a session with your Dialogflow bot and returns an object containing all the functions that allow you to interact with your bot.

**Parameters**:

- `projectId`: **Required**. Your Google project ID. You can find in the settings parameters of Dialogflow under the **GOOGLE PROJECT** section.
- `languageCode`: **Required**. The language code in which you want to request the bot. The default value is `en`. You can find all the language codes supported [here](https://cloud.google.com/dialogflow-enterprise/docs/reference/language).

### `request(text)`

Triggers the [**detectIntent endpoint**](https://cloud.google.com/dialogflow-enterprise/docs/reference/rest/v2/projects.agent.sessions/detectIntent) and returns the first query result.

**Parameters**:

- `text`: **Required**. the query itself. For example: _I want to find restaurants in Paris_.

Under the hood, it uses the session and the language code passed to the bot during the initialisation.

### `newSession()`

If you trigger multiple requests one after the other, the bot will eventually remember things you've set in contexts or trigger the follow-up intents.

Maybe you want to clean all that state and request your bot in the same test. For that you have two solutions:

1. Recreate a new bot: `const otherBot = createBot("my-project-id", "de")`
2. Call the `newSession` method. It will create a session and all methods associated to it with the exact same parameters you passed to the first `createBot` request.

## Custom matchers

When you make a request to the bot using `request`, you get a global object from Dialogflow. It is a daunting task to go through all the object and make sure that the context have been set, intent is correctly matched, etc. That's why this library extends the Jest matchers. You only pass the response from Dialogflow and we take care of the everything else.

### `expect(result).toHaveIntent(intent)`

Asserts your intent is the correct one.

**Parameters**:

- `result`: an instance of [**QueryResult**](https://cloud.google.com/dialogflow-enterprise/docs/reference/rest/v2/projects.agent.sessions/detectIntent#QueryResult)
- `intent`: the intent that should be matched.

**Example**:

```js
test("A sentence match the right intent", async () => {
  const { request } = bot;
  const result = await request("i like yellow");
  expect(result).toHaveIntent("favorite color");
});
```

### `expect(result).toHaveContext(context)`

Asserts your query result does contain in its output contexts the context you passed as an argument.

**Parameters**:

- `result`: an instance of [**QueryResult**](https://cloud.google.com/dialogflow-enterprise/docs/reference/rest/v2/projects.agent.sessions/detectIntent#QueryResult)
- `context`: an instance of [**Context**](https://cloud.google.com/dialogflow-enterprise/docs/reference/rest/v2/projects.agent.sessions.contexts#Context) that should be contained in the query result.

**Example**:

```js
test("The result has the right context", async () => {
  const { request } = bot;
  const result = await request("I want to find activities in paris");

  expect(result).toHaveContext({
    name: "city",
    lifespanCount: 2,
    parameters: {
      currentCity: "paris"
    }
  });
});
```

**Note**: `name`, `lifespanCount` and `parameters` are required.

### `expect(result).toHaveTextResult(text)`

Asserts one of your response contains the text you passed as an argument.

**Parameters**:

- `result`: an instance of [**QueryResult**](https://cloud.google.com/dialogflow-enterprise/docs/reference/rest/v2/projects.agent.sessions/detectIntent#QueryResult)
- `text`: is a string that should appear in the fulfillment messages of your intent

```js
test("It returns a question if talk about our favorite color", async () => {
  const { request } = bot;
  const result = await request("I like yellow");
  expect(result).toHaveTextResult("Do you want to learn more about yellow?");
});
```

### `expect(result).toHaveOneOfTextResults(textArray)`

One of best practices of conversational design is to [vary the answers](https://designguidelines.withgoogle.com/conversation/style-guide/language.html) you give to the user so the conversation feels more dynamic and natural. Thus, if you randomize the answers returned to the user, you can use this matcher to assert one of your expected text does match what the bot answered.

**Parameters**:

- `result`: an instance of [**QueryResult**](https://cloud.google.com/dialogflow-enterprise/docs/reference/rest/v2/projects.agent.sessions/detectIntent#QueryResult)
- `textArray`: an array of sentences whose one should appear in the fulfillment messages of your intent

```js
test("It returns a question if the user talks about our favorite color", async () => {
  const { request } = bot;
  const result = await request("I like yellow");
  expect(result).toHaveOneOfTextResults([
    "Do you want to learn more about yellow?",
    "Yellow is a great color! Do you want to know more about it?",
    "Me too. Want to learn more about yellow ?"
  ]);
});
```

### `expect(result).toHaveQuickReplies(quickReplies)`

Asserts the displayed suggestion chips are the same as the ones you provided.

- `result`: an instance of [**QueryResult**](https://cloud.google.com/dialogflow-enterprise/docs/reference/rest/v2/projects.agent.sessions/detectIntent#QueryResult)
- `quickReplies`: an array of quick replies.

```js
test("It returns a question if talk about our favorite color", async () => {
  const { request } = bot;
  const result = await request("Pick a random color");

  expect(result).toHaveQuickReplies(["Another one", "Learn more", "Share it"]);
});
```

**Note**: the **order of your quick replies matters**. `["Another one", "Learn more", "Share it"]` is not the same as `["Another one", "Share it", "Learn more"]`.

### `expect(result).toHaveCard(expectedCard)`

Asserts the displayed card is the same as the one you've provided

- `result`: an instance of [**QueryResult**](https://cloud.google.com/dialogflow-enterprise/docs/reference/rest/v2/projects.agent.sessions/detectIntent#QueryResult)
- `expectedCard`: an instance of [**BasicCard**](https://cloud.google.com/dialogflow-enterprise/docs/reference/rest/v2/projects.agent.intents#card)

```js
test("It returns a question if talk about our favorite color", async () => {
  const { request } = bot;
  const result = await request("Tell me more about yellow");

  expect(result).toHaveCard({
    title: "Yellow",
    subtitle: "Color between orange and red",
    imageUri: "https://myappaboutcolors.dev/yellow.jpg",
    buttons: [
      {
        text: "Learn more about yellow",
        postback: "https://myappaboutcolors.dev/yellow"
      }
    ]
  });
});
```

## Roadmap

- Test this library
- Add support for Actions On Google
- Add support for Facebook Messenger,
- Add custom matchers for basic cards
- Add custom matchers for parameters
