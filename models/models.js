const db = require('../db/connection.js');
const format = require('pg-format');

exports.selectAllTopics = ()=>{
    return db.query(`SELECT * from topics`)
    .then((result)=>{
        return result.rows
    })
}