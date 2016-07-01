/**
 * Created by loganxie on 16/7/1.
 */

var WXBizMsgCrypt = require('wechat-crypto');
var config = require('../config/dingTalk');
var newCrypt = new WXBizMsgCrypt(config.token, config.encodingAESKey, config.suiteid || 'suite4xxxxxxxxxxxxxxx');
var TICKET_EXPIRES_IN = config.ticket_expires_in || 1000 * 60 * 20 //20分钟

function parse(req,res,next){
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var encrypt = req.body.encrypt;
    if (signature !== newCrypt.getSignature(timestamp, nonce, encrypt)) {
        return next({
            status:401,
            message:'Invalid signature'
        })
    }

    var result = newCrypt.decrypt(encrypt);
    var message = JSON.parse(result.message);
    if (message.EventType === 'check_update_suite_url' || message.EventType === 'check_create_suite_url') { //创建套件第一步，验证有效性。
        var Random = message.Random;
        result = _jsonWrapper(timestamp, nonce, Random);
        return res.json(result);
    } else {
        res.reply = function() { //返回加密后的success
            result = _jsonWrapper(timestamp, nonce, 'success');
            res.json(result);
        }

        if (message.EventType === 'suite_ticket') {
            var data = {
                value: message.SuiteTicket,
                expires: Number(message.TimeStamp) + TICKET_EXPIRES_IN
            };
            res.reply();
        }else{
            req.dtMessage = message;
            next();
        }
    }
}

function _jsonWrapper(timestamp, nonce, text) {
    var encrypt = newCrypt.encrypt(text);
    var msg_signature = newCrypt.getSignature(timestamp, nonce, encrypt); //新签名
    return {
        msg_signature: msg_signature,
        encrypt: encrypt,
        timeStamp: timestamp,
        nonce: nonce
    };
}


module.exports = {
    parse:parse
};