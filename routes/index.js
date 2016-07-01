var express = require('express');
var router = express.Router();
var dingTalkMiddleWare = require('../middleware/dingTalk');
router.all('/',function(req,res,next){
    res.send('logan dingtalk');
});

router.post('valid',dingTalkMiddleWare.parse,function(req,res,next){
    res.send('dingtalk valid');
});

module.exports = router;