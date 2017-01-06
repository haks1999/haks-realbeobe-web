var path = require('path');


module.exports = function(app){

    app.get('/login', function(req, res){
        res.render('login', {
            title: 'Express Login'
        });
    });

    app.get('/',function(req,res){
        res.sendFile('../public/index_old.html');
    });
};


