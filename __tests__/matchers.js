const result = {
  fulfillmentMessages: [],
  outputContexts: [{}],
  queryText: "find me activities",
  intent: {
    displayName: "activities"
  }
};

describe("Testing matchers", () => {
  test("toHaveIntent", () => {
    expect(result).toHaveIntent("activities");
    expect(() => expect(result.toHaveIntent("test")).toThrowError());
  });
});
