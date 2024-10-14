const app = require('./app.js');

app.listen(8080, (err) =>{
    if(err){
        console.log(err)
    }
    console.log('Listening on 8080')
})