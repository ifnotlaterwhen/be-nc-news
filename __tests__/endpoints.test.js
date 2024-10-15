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
            test('GET /api', ()=>{
                return request(app)
                .get('/api')
                .expect(200)
                .then(({body})=>{
                    expect(body.endpoints).toEqual(endpointsObj)
                })
            })
        })

        describe('GETting article by article id',()=>{
            test('GET /api/articles/:article_id', ()=>{
                return request(app)
                .get('/api/articles/1')
                .expect(200)
                .then(({body})=>{
                    expect(body.article.article_id).toBe(1);
                    expect(typeof body.article.title).toBe('string');
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
            test('/api/articles',()=>{
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
            test('/api/articles/:article_id/comments',()=>{
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
            test('POST /api/articles/:article_id/comments', ()=>{
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
        })

    })
})
