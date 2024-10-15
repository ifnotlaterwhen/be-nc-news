const db = require('../db/connection.js');
const format = require('pg-format');
const endpoints = require('../endpoints.json')

exports.selectAllTopics = ()=>{
    return db.query(`SELECT * from topics`)
    .then((result)=>{
        return result.rows
    })
}

exports.fetchArticleById = (id) => {
    return db.query(`SELECT * from articles WHERE article_id = $1`, [id])
    .then(({rows})=>{
        if(rows.length === 0){
            return Promise.reject({status:404, msg: "article does not exist"})
        }
        return rows[0]
    })
}

exports.fetchAllArticles = ()=>{
    return db.query(`SELECT articles.article_id, 
        articles.title, 
        articles.author, 
        articles.topic, 
        articles.created_at, 
        articles.votes, 
        articles.article_img_url, 
        COUNT(comments.comment_id) AS comment_count 
        FROM articles 
        LEFT JOIN comments ON articles.article_id = comments.article_id 
        GROUP BY articles.article_id 
        ORDER BY articles.created_at DESC`)
        .then(({rows})=>{
            return rows
        })
}

exports.fetchCommentsByArticleId = (article_id)=>{
    return db.query(`SELECT * FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC`, [article_id])
        .then(({rows})=>{
            return rows
        })
}

exports.fetchEndpoints= ()=>{
    return endpoints
}
