var express = require('express');
var router = express.Router();
var dingTalkMiddleWare = require('../middleware/dingTalk');
router.all('/',dingTalkMiddleWare.parse,function(req,res,next){
    res.send('logan dingtalk');
});

module.exports = router;