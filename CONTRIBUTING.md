# Contributing to Dialogflow testing library

Thanks for considering contributing to this testing library! 🙌

You can improve this library in many ways: refactoring the code, spotting typos, adding new features, finding bugs.

## I found a bug or spotted a typo 🐞

Just submit an issue!

## I want to add something to the code (refactoring, feature, fixing bugs, ...) 💡

1. Fork the repo by clicking on the fork button.

2. Clone it to work on it locally.

3. Create a new branch whose name starts by the type of changes you make: `feature`, `fix`, `refactor` followed by what your code adds to the library.

**For example:**

- `feature/to-have-quick-replies-matcher`
- `fix/request-not-working`
- `refactor/move-matchers-to-dedicated-files`

```sh
git checkout -b feature/to-have-quick-replies-matcher
```

4. Commit your changes on that branch:

```sh
git add src/matchers.js
git commit -m "Add toHaveQuickReplies matcher"
```

5. Push your branch to the original repo

```sh
git push origin feature/to-have-quick-replies-matcher
```

6. Open a pull request on the original repository and resolve any conflicts if needed.

7. We may discuss about your changes at that time. If all pass, the PR should be merged.
