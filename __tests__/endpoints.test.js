const request = require('supertest');
const app = require('../app.js');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const data = require('../db/data/test-data');

beforeEach(()=>{
    return seed(data)
})

afterAll(()=>{
    return db.end()
})

describe('NC news endpoint tests',()=>{
    describe('GETting news',()=>{
        test('GET /api/topics',()=>{
            return request(app)
            .get('/api/topics')
            .expect(200)
            .then(({body})=>{
                expect(Array.isArray(body.topics)).toBe(true)
                body.topics.forEach(topic=>{
                    expect(typeof topic.description).toBe('string')
                    expect(typeof topic.slug).toBe('string')
                })
            })
        })
    })
})
