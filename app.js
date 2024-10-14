const express = require('express');
const { getAllTopics, serverErrorHandler, customErrorHandler, psqlErrorHandler, allErrorHandler, getEndpoints, getArticleById, getAllArticles } = require('./controllers/controllers');
const app = express();

app.get('/api/topics', getAllTopics);

app.get('/api', getEndpoints);

app.get('/api/articles/:article_id', getArticleById);

app.get('/api/articles', getAllArticles);

app.use(psqlErrorHandler);

app.use(customErrorHandler);

app.use(serverErrorHandler);

app.all('*', allErrorHandler);

module.exports = app