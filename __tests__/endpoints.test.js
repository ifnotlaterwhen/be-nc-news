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
    })
})
