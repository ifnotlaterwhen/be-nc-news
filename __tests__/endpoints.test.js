const request = require('supertest');
const app = require('../app.js');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const data = require('../db/data/test-data');
const endpointsObj = require('../endpoints.json')

beforeEach(()=>{
    return seed(data)
})

afterAll(()=>{
    return db.end()
})

describe('NC news endpoint tests',()=>{
    describe('GETting news',()=>{
        describe('GETting all topics',()=>{
            test('GET /api/topics',()=>{
                return request(app)
                .get('/api/topics')
                .expect(200)
                .then(({body})=>{
                    expect(Array.isArray(body.topics)).toBe(true)
                    expect(body.topics.length).toBe(3)
                    body.topics.forEach(topic=>{
                        expect(typeof topic.description).toBe('string')
                        expect(typeof topic.slug).toBe('string')
                    })
                })
            })
        })
        describe('GETting all the available apis',()=>{
            test('Respond with 200 and all available apis', ()=>{
                return request(app)
                .get('/api')
                .expect(200)
                .then(({body})=>{
                    expect(body.endpoints).toEqual(endpointsObj)
                })
            })
        })

        describe('GETting article by article id',()=>{
            test('Respond with 200 with the correct article given valid and existent id', ()=>{
                return request(app)
                .get('/api/articles/1')
                .expect(200)
                .then(({body})=>{
                    expect(body.article.article_id).toBe(1);
                    expect(typeof body.article.topic).toBe('string');
                    expect(typeof body.article.topic).toBe('string');
                    expect(typeof body.article.author).toBe('string');
                    expect(typeof body.article.body).toBe('string');
                    expect(typeof body.article.created_at).toBe('string');
                    expect(typeof body.article.votes).toBe('number');
                    expect(typeof body.article.article_img_url).toBe('string');
    
                })
            })
            test('Respond with 400 when given invalid param',()=>{
                return request(app)
                .get('/api/articles/one')
                .expect(400)
                .then(({body})=>{
                    expect(body.msg).toBe("Bad Request")
                })
            })
            test('Respond with 404 when given valid but non existent param',()=>{
                return request(app)
                .get('/api/articles/4000')
                .expect(404)
                .then(({body})=>{
                    expect(body.msg).toBe("article does not exist")
                })
            })
        })
        describe('GETting all articles',()=>{
            test('Respond with 200 with all the apis available',()=>{
                return request(app)
                .get('/api/articles')
                .expect(200)
                .then(({body})=>{
                    expect(body.articles.length > 0).toBe(true)
                        body.articles.forEach(article=>{
                            expect(typeof article.article_id).toBe('number');
                            expect(typeof article.title).toBe('string');
                            expect(typeof article.author).toBe('string');
                            expect(typeof article.topic).toBe('string');
                            expect(typeof article.created_at).toBe('string');
                            expect(typeof article.votes).toBe('number');
                            expect(typeof article.article_img_url).toBe('string');
                            expect(typeof article.comment_count).toBe('number');
                        })
                })
            })
        })
        describe('GETting comments by article id',()=>{
            test('Respond with 200 with the correct comment',()=>{
                return request(app)
                .get('/api/articles/1/comments')
                .expect(200)
                .then(({body})=>{
                        expect(body.comments.length > 0).toBe(true)
                        body.comments.forEach(comment=>{
                            expect(typeof comment.comment_id).toBe('number')
                            expect(typeof comment.votes).toBe('number');
                            expect(typeof comment.created_at).toBe('string');
                            expect(typeof comment.author).toBe('string');
                            expect(typeof comment.body).toBe('string');
                            expect(typeof comment.article_id).toBe('number');
                        })
                        expect(body.comments).toBeSortedBy('created_at', {descending:true})
                })
            })
            test('Respond with 400 when given invalid param',()=>{
                return request(app)
                .get('/api/articles/random/comments')
                .expect(400)
                .then(({body})=>{
                    expect(body.msg).toBe('Bad Request')
                })
            })
            test('Respond with 404 when given valid but non existent id',()=>{
                return request(app)
                .get('/api/articles/9999/comments')
                .expect(404)
                .then(({body})=>{
                    expect(body.msg).toBe("article does not exist")
                })
            })
            test('Respond with 200 and an empty array when given existent id but no comments ',()=>{
                return request(app)
                .get('/api/articles/13/comments')
                .expect(200)
                .then(({body})=>{
                    expect(body.comments).toEqual([])
                })
            })
        })
    })
    describe('POSTing news',()=>{
        describe('POSTing new comment',()=>{
            test('respond with 200 with the correct comment posted', ()=>{
                const commentToAdd = {username: "lurker", body: "this article is wack"}
                const newComment = {
                    body:  "this article is wack",
                    votes: 0,
                    author: "lurker",
                    article_id: 13
                  }
                return request(app)
                .post('/api/articles/13/comments')
                .send(commentToAdd)
                .expect(201)
                .then(({body})=>{
                    expect(body.comment.body).toBe(newComment.body);
                    expect(body.comment.votes).toBe(newComment.votes);
                    expect(body.comment.author).toBe(newComment.author);
                    expect(body.comment.article_id).toBe(newComment.article_id);
                    expect(typeof body.comment.created_at).toBe('string');
                })
            })
            test('respond with 404 when provided a valid but non-existent article_id', ()=>{
                const commentToAdd = {username: "lurker", body: "this article is wack"}
                return request(app)
                .post('/api/articles/9999/comments')
                .send(commentToAdd)
                .expect(404)
                .then(({body})=>{
                    expect(body.msg).toBe('article does not exist')
                })
            })
            test('respond with 400 when provided an invalid param', ()=>{
                const commentToAdd = {username: "lurker", body: "this article is wack"}
                return request(app)
                .post('/api/articles/meow/comments')
                .send(commentToAdd)
                .expect(400)
                .then(({body})=>{
                    expect(body.msg).toBe('Bad Request')
                })
            })
            test('respond with 201 when passed an object with unecessary properties', ()=>{
                const commentToAdd = {username: "lurker", body: "this article is wack", votes: 10, article_id: 5000}
                const newComment = {
                    body:  "this article is wack",
                    votes: 0,
                    author: "lurker",
                    article_id: 13
                  }
                return request(app)
                .post('/api/articles/13/comments')
                .send(commentToAdd)
                .expect(201)
                .then(({body})=>{
                    expect(body.comment.body).toBe(newComment.body);
                    expect(body.comment.votes).toBe(newComment.votes);
                    expect(body.comment.author).toBe(newComment.author);
                    expect(body.comment.article_id).toBe(newComment.article_id);
                    expect(typeof body.comment.created_at).toBe('string');
                })
            })
            test('respond with 400 when there are missing fields', ()=>{
                const commentToAdd = {body: "this article is wack"}
                return request(app)
                .post('/api/articles/meow/comments')
                .send(commentToAdd)
                .expect(400)
                .then(({body})=>{
                    expect(body.msg).toBe('Missing required fields')
                })
            })
            test('respond with 404 when username does not exist', ()=>{
                const commentToAdd = {username: "goat", body: "this article is wack"}
                return request(app)
                .post('/api/articles/13/comments')
                .send(commentToAdd)
                .expect(404)
                .then(({body})=>{
                    expect(body.msg).toBe('Username does not exists')
                })
            })
        })

    })
    describe('PATCHing news',()=>{
        describe('PATCH article by article id',()=>{
            test('Respond with 201 and an updated article when passed valid request body and article id',()=>{
                const patch = {inc_votes: -10}
                const patched = {
                    article_id: 13,
                    title: 'Another article about Mitch',
                    topic: 'mitch',
                    author: 'butter_bridge',
                    body: 'There will never be enough articles about Mitch!',
                    votes: 0,
                    article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
                  }
                return request(app)
                .patch('/api/articles/13')
                .send(patch)
                .expect(201)
                .then(({body})=>{
                    expect(body.patchedArticle.article_id).toBe(patched.article_id);
                    expect(body.patchedArticle.title).toBe(patched.title);
                    expect(body.patchedArticle.topic).toBe(patched.topic);
                    expect(body.patchedArticle.author).toBe(patched.author);
                    expect(body.patchedArticle.body).toBe(patched.body);
                    expect(body.patchedArticle.votes).toBe(patched.votes);
                    expect(body.patchedArticle.article_img_url).toBe(patched.article_img_url);
                    expect(typeof body.patchedArticle.created_at).toBe('string')
                })
            })
            test('respond with 400 when passed invalid data type',()=>{
                const patch = {inc_votes: ""}
                return request(app)
                .patch('/api/articles/13')
                .send(patch)
                .expect(400)
                .then(({body})=>{
                    expect(body.msg).toBe("Bad Request")
                })
            })
            test('respond with 404 when provided article_id does not exist',()=>{
                const patch = {inc_votes: 5}
                return request(app)
                .patch('/api/articles/9999')
                .send(patch)
                .expect(404)
                .then(({body})=>{
                    expect(body.msg).toBe("article does not exist")
                })
            })
            test('respond with 400 when provided article_id is invalid',()=>{
                const patch = {inc_votes: 5}
                return request(app)
                .patch('/api/articles/hello')
                .send(patch)
                .expect(400)
                .then(({body})=>{
                    expect(body.msg).toBe("Bad Request")
                })
            })
            test('respond with 400 when passed incorrect key/ when inc_votes does not exist',()=>{
                const patch = {random: 4}
                return request(app)
                .patch('/api/articles/13')
                .send(patch)
                .expect(400)
                .then(({body})=>{
                    expect(body.msg).toBe("Bad Request")
                })
            })
            test('Ignore unecessary properties and respond with 201',()=>{
                const patch = {inc_votes: -10, username: "goat"}
                const patched = {
                    article_id: 13,
                    title: 'Another article about Mitch',
                    topic: 'mitch',
                    author: 'butter_bridge',
                    body: 'There will never be enough articles about Mitch!',
                    votes: 0,
                    article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
                  }
                return request(app)
                .patch('/api/articles/13')
                .send(patch)
                .expect(201)
                .then(({body})=>{
                    expect(body.patchedArticle.article_id).toBe(patched.article_id);
                    expect(body.patchedArticle.title).toBe(patched.title);
                    expect(body.patchedArticle.topic).toBe(patched.topic);
                    expect(body.patchedArticle.author).toBe(patched.author);
                    expect(body.patchedArticle.body).toBe(patched.body);
                    expect(body.patchedArticle.votes).toBe(patched.votes);
                    expect(body.patchedArticle.article_img_url).toBe(patched.article_img_url);
                    expect(typeof body.patchedArticle.created_at).toBe('string')
                })
            })
        })
    })
    describe('DELETEting news',()=>{
        describe('DELETE the comment by comment id',()=>{
            test('Respond with 204 and no content', ()=>{
                return request(app)
                .delete('/api/comments/1')
                .expect(204)
                .then(({body}) => {
                    expect(body).toEqual({});
                })
            })
            test('Respond with 404 when passed a valid but non existent comment_id', ()=>{
                return request(app)
                .delete('/api/comments/9999')
                .expect(404)
                .then(({body}) => {
                    expect(body.msg).toBe("comment not found");
                })
            })
            test('Respond with 400 when passed an invalid comment_id', ()=>{
                return request(app)
                .delete('/api/comments/bye')
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe("Bad Request");
                })
            })
        })
    })
    describe('GETting users', ()=>{
        describe('GET an array of all users',() => {
            test('Respond with 200 and an array of objects with all users', () => {
                return request(app)
                .get('/api/users')
                .expect(200)
                .then(({body}) => {
                    expect(body.users.length > 0).toBe(true);
                    body.users.forEach(user =>{
                        expect(typeof user.username).toBe('string');
                        expect(typeof user.name).toBe('string');
                        expect(typeof user.avatar_url).toBe('string');
                    })
                })
            })
            test('Respond with 404 when passed invalid path', () => {
                return request(app)
                .get('/api/usrs')
                .expect(404)
                .then(({body}) => {
                    expect(body.msg).toBe('path not found');
                })
            })
        })
    })
})
