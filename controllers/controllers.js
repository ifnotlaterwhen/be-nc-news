const { selectAllTopics, fetchEndpoints, fetchArticleById, fetchAllArticles, fetchCommentsByArticleId, writeCommentByArticleId } = require("../models/models")

exports.getAllTopics = (req, res, next)=>{
    selectAllTopics().then(topics => {
        res.status(200).send({topics})
    })
}

exports.getArticleById = (req,res, next)=>{
    const {article_id} = req.params; 
    fetchArticleById(article_id).then(article => {
        res.status(200).send({article})
    })
    .catch(next)
}

exports.getAllArticles = (req,res,next)=>{
    fetchAllArticles().then(articles => {
        articles.map(article=>{
            article.comment_count = Number(article.comment_count)
            return article
        })
        res.status(200).send({articles})
    })
    .catch(next)
}

exports.getCommentsByArticleId = (req,res,next)=>{
    const {article_id} = req.params
    const promises = [fetchCommentsByArticleId(article_id),fetchArticleById(article_id)]
    Promise.all(promises)
    .then(results => {
        const comments = results[0]
        res.status(200).send({comments})
    })
    .catch(next)
}

exports.postCommentbyArticleId = (req,res,next)=>{
    const {article_id} = req.params;
    const newComment = req.body;
    const promises = [fetchArticleById(article_id), writeCommentByArticleId(article_id,newComment)]
    Promise.all(promises).then(result => {
        const comment = result[1];
        res.status(201).send({comment})
    })
    .catch(next)
}

exports.psqlErrorHandler = (err,req,res,next)=>{
    if(err.code === '22P02' || err.code === '23502'){
        res.status(400).send({msg: "Bad Request"})
    }
    next(err)   
}
exports.customErrorHandler = (err,req,res,next)=>{
    if(err.status && err.msg){
        res.status(err.status).send({msg: err.msg})
    }
    next(err)

}
exports.serverErrorHandler = (err,req,res,next)=>{
    res.status(500).send({msg: "Internal Server Error"})
    next(err)

}

exports.allErrorHandler = (err,req,res,next)=>{
    res.status(404).send({msg: "path not found"})

}

exports.getEndpoints = (req,res,next) => {
    const endpoints = fetchEndpoints()
    res.status(200).send({endpoints})
}

