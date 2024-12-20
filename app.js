const express = require('express');
const { getAllTopics, serverErrorHandler, customErrorHandler, psqlErrorHandler, allErrorHandler, getEndpoints, getArticleById, getAllArticles, getCommentsByArticleId, postCommentbyArticleId, deleteCommentById, getAllUsers, getUserByUsername, patchVoteById, postNewArticle, secretMessageToJenn } = require('./controllers/controllers');
const app = express();
const cors = require('cors')

app.use(cors())

app.use(express.json())

app.get('/api/topics', getAllTopics);

app.get('/api', getEndpoints);

app.get('/api/articles/:article_id', getArticleById);

app.get('/api/articles', getAllArticles);

app.get('/api/articles/:article_id/comments', getCommentsByArticleId);

app.post('/api/articles/:article_id/comments', postCommentbyArticleId);

app.patch('/api/articles/:article_id', patchVoteById);

app.delete('/api/comments/:comment_id', deleteCommentById);

app.get('/api/users', getAllUsers);

app.get('/api/users/:username', getUserByUsername);

app.patch('/api/comments/:comment_id', patchVoteById)

app.get('/api/jenn', secretMessageToJenn)

// app.post('/api/articles', postNewArticle);

app.use(psqlErrorHandler);

app.use(customErrorHandler);

app.use(serverErrorHandler);

app.all('*', allErrorHandler);

module.exports = app