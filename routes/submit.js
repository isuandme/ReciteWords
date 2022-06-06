const express = require('express');//导入express模块
const router = express.Router();
const Submission = require('./../models/submission');//导入./../models/submission文件
const moment = require('moment');//导入moment模块

router.get('/', (req, res) => {
    let page = req.query.p;//获取点击“提交记录”的信息
    console.log(req.query.p);
    if(!page) {res.redirect('/');return;}
    Submission.find({}).sort({'_id': -1}).skip((page - 1) * 8).limit(8).exec((err, result) => {//result是在点击提交中心后发送的通关信息
        // console.log(result);
        for(let i=0; i<result.length; i++) {

            result[i].time = moment(result[i].createdAt).format('YYYY-MM-DD HH:MM');//以YYYY-MM-DD HH:MM的形式显示之前通关的时间
        }
        Submission.find({}, (err, all) => {//all同上result
            let len = parseInt(all.length / 8) + (all.length % 8 != 0);//len指的是通关数量
            res.render('submit', {
                user: req.user,
                submits: result,
                len: len,
                now: page
            });
        });
    });
});//本函数用于渲染submit.ejs网页

module.exports = router;//公开模块
