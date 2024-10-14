const { selectAllTopics, fetchEndpoints } = require("../models/models")

exports.getAllTopics = (req, res, next)=>{
    selectAllTopics().then(topics => {
        res.status(200).send({topics})
    })
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