const db = require('../db/connection.js');
const format = require('pg-format');
const endpoints = require('../endpoints.json')

exports.fetchEndpoints= ()=>{
    return endpoints
}

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

exports.fetchAllArticles = ({sort_by = 'created_at', order = 'desc', ...rest})=>{

    return db.query(`SELECT slug FROM topics`)
    .then(({rows}) => {
        for(let query in rest){
            if(!['sort_by', 'order', 'topic'].includes(query)){
                return Promise.reject({status:400, msg: 'Invalid query'})
            }
        }
        const sortColumns = ['title', 'topic', 'author', 'created_at'];
        const orderOptions = ['asc', 'desc'];
        const topicsOptions = rows.map(topic=>{
            return topic.slug
        })
    
        if(!sortColumns.includes(sort_by) || !orderOptions.includes(order) || !topicsOptions.includes(rest.topic) && rest.topic){
            return Promise.reject({status:400, msg: 'Bad Request'})
        }
    
        let queryStr = `SELECT articles.article_id, 
            articles.title, 
            articles.author, 
            articles.topic, 
            articles.created_at, 
            articles.votes, 
            articles.article_img_url, 
            CAST(COUNT(comments.comment_id) AS INTEGER) AS comment_count
            FROM articles
            LEFT JOIN comments ON articles.article_id = comments.article_id`
    
        if(rest.topic){
            queryStr += ` WHERE articles.topic = '${rest.topic}'`
        }
    
        queryStr += ` GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order.toUpperCase()}`
    
        return db.query(queryStr)
            .then(({rows})=>{
                return rows
            })
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

exports.fetchCommentByCommentId = (comment_id) => {
    return db.query(`SELECT * FROM comments
        WHERE comment_id = $1`, [comment_id])
        .then(({rows}) => {
            if(rows.length === 0){
                return Promise.reject({status: 404, msg: 'this comment id does not exist'})
            }
            return rows[0]
        })
}

exports.fetchUserbyUsername = (username)=>{
    return db.query(`SELECT * FROM users
        WHERE username = $1`, [username])
        .then(({rows})=>{
            if(rows.length === 0){
                return Promise.reject({status:404, msg: "Username does not exists"})
            }
            return rows[0]
        })
}
exports.writeCommentByArticleId = (article_id, newComment) => {
    if(!newComment.body || !newComment.username){
        return Promise.reject({status: 400, msg: "Missing required fields"})
    }
    return db.query(`INSERT INTO comments
        (body, votes, author, article_id, created_at)
        VALUES
        ($1, 0, $2, $3, NOW()) RETURNING *`, [newComment.body, newComment.username, article_id])
        .then(({rows})=>{
            return rows[0]
        })
}

exports.updateVotesById = (idObj, patchBody) => {
    const newVotes = patchBody.inc_votes;
    if(!newVotes){
        return Promise.reject({status:400, msg:"Bad Request"})
    }
    if(idObj.comment_id){
        return db.query(`UPDATE comments
            SET votes = GREATEST(votes + $1, 0)
            WHERE comment_id = $2
            RETURNING *`, [newVotes, idObj.comment_id])
            .then(({rows})=>{
                return rows[0]
            })
    }
    if(idObj.article_id){
        return db.query(`UPDATE articles
            SET votes = GREATEST(votes + $1, 0)
            WHERE article_id = $2
            RETURNING *`, [newVotes, idObj.article_id])
            .then(({rows})=>{
                return rows[0]
            })
    }
}

exports.removeCommentsById = (comment_id) => {
    return db.query(`DELETE FROM comments
        WHERE comment_id = $1 RETURNING *`, [comment_id])
        .then(({rows}) => {
            if(rows.length === 0){
                return Promise.reject({status: 404, msg: "comment not found"})
            }
            //return rows[0] <--no need for this
        })
}

exports.fetchAllUsers = () => {
    return db.query(`SELECT * FROM users`)
    .then(({rows}) => {
        return rows
    })
}

