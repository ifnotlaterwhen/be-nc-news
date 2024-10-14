const express = require('express');
const { getAllTopics, serverErrorHandler, customErrorHandler, psqlErrorHandler, allErrorHandler } = require('./controllers/controllers');
const app = express();

app.get('/api/topics', getAllTopics);

app.use(psqlErrorHandler);

app.use(customErrorHandler);

app.use(serverErrorHandler);

app.all('*', allErrorHandler);

module.exports = app