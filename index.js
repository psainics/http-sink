import express from "express";
import objectHash from "object-hash";

// Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
// app.use(express.raw({ type: '*/*' }));

// Environment variables
const ENV = {
  PORT: 3000,
  PUBLIC: "public",
  UI: "/http-sink",
  ENDPOINT: "/sink",
};

// Serve static files
app.use(ENV.UI, express.static(ENV.PUBLIC));
// redirect root to UI
app.get("/", (req, res) => {
    res.redirect(ENV.UI);
});

const messageQueue = [];
let rejectMessageMap = {};

app.get(ENV.ENDPOINT, (req, res) => {
  res.json(messageQueue);
});

app.post(ENV.ENDPOINT, (req, res) => {
  const message = req.body;
  const contentType = req.headers["content-type"];
  if (messageQueue.length <= 5) {
    addMessage(message, contentType);
    res.json(message);
  } else {
    rejectMessageMap[objectHash(message)];
    // get how may times the message has been rejected
    const rejectCount = rejectMessageMap[objectHash(message)];
    if (rejectCount) {
      if (rejectCount >= 2) {
        addMessage(message, contentType);
        res.json(message);
        rejectMessageMap[objectHash(message)] = 0;
        return;
      }
      rejectMessageMap[objectHash(message)] = rejectCount + 1;
    } else {
      rejectMessageMap[objectHash(message)] = 1;
    }
    addMessage(message, "#REJECTED @ " + rejectMessageMap[objectHash(message)]);
    res.status(429).json({ message: "Too Many Requests" });
  }
});

app.delete(ENV.ENDPOINT, (req, res) => {
    messageQueue.length = 0;
    rejectMessageMap = {};
    testData.forEach((data) => {
        addMessage(data, "SERVER");
    });
    res.json({ message: "OK" });
});

const addMessage = (message, type) => {
  messageQueue.push({ message, _timestamp: Date.now(), _type: type });
};

app.listen(ENV.PORT, () => {
  console.log(`Server listening on port ${ENV.PORT}`);
});

const testData = [{ init: "TEST DATA" }];
testData.forEach((data) => {
  addMessage(data, "SERVER");
});
