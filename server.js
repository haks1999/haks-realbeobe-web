var path = require('path');
var moment = require('moment');

var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 10,
    host     : 'realbeobe.cwirqa0sfusi.ap-northeast-2.rds.amazonaws.com',
    user     : 'haks1999',
    password : 'haks2000',
    database : 'realbeobe',
});

var express = require('express');
var app = express();
app.use('/static', express.static('public'));

app.listen(9000, function () {
    console.log('listening on port 9000!');
});



app.get('/',function(req,res){
    res.sendFile(path.join(__dirname + '/public/index_old.html'));
});


var COMMON_CODE = {
    SITE : {
        'HU':'humoruniv',
        'TH':'todayhumor',
        'RW':'ruliweb',
        'BD':'bobaedream'
    },
    SORT : {
        'cc':'comment_cnt',
        'vc':'view_cnt',
        'gc':'good_cnt',
        'rd':'reg_dt'
    }
};

var postListQuery = "SELECT post_id, site_cd, site_post_id, title, link, comment_cnt, view_cnt, good_cnt, DATE_FORMAT(reg_dt,'%Y-%m-%d %H:%i') reg_dt FROM tb_m_post " +
    'WHERE site_cd IN (:siteCodeList) ORDER BY :order DESC LIMIT :offset, 20';
var postCountQuery = 'SELECT count(*) count FROM tb_m_post ' +
    'WHERE site_cd IN (:siteCodeList)';
app.get('/posts',function(req,res){
    var pageNumber = req.query['p'];
    var sort = req.query['s'];
    var siteCodeList = req.query['scl'];

    if(!siteCodeList || siteCodeList.length < 1) siteCodeList = Object.keys(COMMON_CODE.SITE).join(',');
    if(!pageNumber || isNaN(pageNumber)) pageNumber = 1;
    if(!sort || !COMMON_CODE.SORT[sort]) sort = 'rd';

    var postListQueryBinded = postListQuery.replace(':siteCodeList',"'"+siteCodeList.split(',').join("','")+"'");
    postListQueryBinded = postListQueryBinded.replace(':order', COMMON_CODE.SORT[sort]);
    postListQueryBinded = postListQueryBinded.replace(':offset', (pageNumber-1)*20);

    var postCountQueryBinded = postCountQuery.replace(':siteCodeList',"'"+siteCodeList.split(',').join("','")+"'");

    console.log(postListQueryBinded);

    pool.getConnection(function(err, connection) {
        if(err) res.json({});
        connection.query( postCountQueryBinded, function(err, countResult){
            if(err) res.json({});
            connection.query( postListQueryBinded, function(err, listResult) {
                if(err) res.json({});
                connection.release();
                res.json({
                    totalCount: countResult[0].count,
                    postList: listResult
                });
            });
        });

    });
});
