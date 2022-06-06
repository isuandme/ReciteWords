const express = require('express');
const passport = require('passport');
const passportConfig = require('./../config/passport');
const Account = require('../models/account');
const mongoose = require('mongoose');
const router = express.Router();
const config = require('./../config/config');
const crypto = require('crypto');
const Words = require('../models/create_world');
const datas = require('./../config/testdata');
const Submission = require('./../models/submission');
const fs = require('fs');
router.get('/info', (req, res) => {
    let user = Account.findOne({ username: req.query.user }, (err, user) => {
        if (err || !user) res.send('不存在的用户，或系统错误。');
        else {
            res.render('user/info', {
                queryuser: req.query.user,
                user: req.user,
                passed: user.passed,
            });
        }
    })
});

router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/');
        return;
    }
    res.render('user/login', {
        error: req.flash('error'),
        success: req.flash('success'),
        user: null
    });
});

router.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/user/login',
        successRedirect: '/',
        failureFlash: true
    }),
);

router.get('/registe', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/');
        return;
    }
    let message = req.flash('error');
    res.render('user/registe', {
        user: null,
        message: message,
        hasError: message.length > 0
    });
});

router.get('/password', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/');
        return;
    }
    res.render('user/password', {
        user: req.user,
        error: req.flash('error'),
        success: req.flash('success')
    });
});


function encrypt(password) {
    for (let i = 1; i <= 500; i++) {
        let md5 = crypto.createHash('md5');
        md5.update(password + config.PASSWORD_SALT);
        password = md5.digest('hex');
    }
    return password;
}

router.post('/registe', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (username.length < 4 || username.length > 12) {
        req.flash('error', "用户名过长或过短。");
        res.redirect('/user/registe');
        return;
    }
    let re = new RegExp(/^\w+$/i);
    if (!re.test(username)) {
        console.log(re.test(username));
        req.flash('error', "用户名只能由英文字母数字和下划线组成。");
        res.redirect('/user/registe');
        return;
    }
    if (password.length < 4) {
        req.flash('error', "密码过短(大于4字符)。");
        res.redirect('/user/registe');
        return;
    }
    Account.findOne({ username: username }, (err, user) => {
        if (user) {
            req.flash('error', "用户已经存在。");
            res.redirect('/user/registe');
        } else {
            let account = new Account({
                username: username,
                password: encrypt(password)
            })
            account.save().then(() => {
                req.flash('success', '注册成功，请开始登录吧！');
                res.redirect('/user/login');
            });
        }
    });
});

router.post('/changepassword', (req, res) => {
    if (!req.user) {
        res.redirect('/');
        return;
    }
    if (req.body.new1 != req.body.new2) {
        req.flash('error', '两次的新密码输入不一致。');
        res.redirect('/user/password');
        return;
    }
    let oldPass = req.body.old;
    let newPass = req.body.new1;
    if (newPass.length < 4) {
        req.flash('error', "密码过短(大于4字符)。");
        res.redirect('/user/password');
        return;
    }
    Account.findOne({ username: req.user.username }, (err, query) => {
        if (encrypt(oldPass) != query.password) {
            req.flash('error', '原密码输入错误。');
            res.redirect('/user/password');
            return;
        }
        query.password = encrypt(newPass);
        query.save();
        req.flash('success', '改密码成功。');
        res.redirect('/user/password');
    });
})

router.use('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});
router.get('/takin', (req, res) => {
    alert('录入成功！')
    res.render('user/takin', {
        error: req.flash('error'),
        success: req.flash('success'),
        user: req.user
    });
});
router.post('/takin', (req, res) => {
    let words = req.body.word;
    let mean = req.body.mean;
    let Pos = req.body.Pos;
    let word = new Words({
        word: words,
        mean: mean,
        Pos: Pos
    })
    word.save();
});
router.get('/select', (req, res) => {
    res.render('user/select', {
        user: req.user,
        error: req.flash('error'),
        success: req.flash('success')
    });
});
router.post('/select', (req, res) => {
    let flag = false;
    let word = req.body.select;
    // let files = fs.readdirSync('./sources');
    // for(let i in files) {
    //     let filePath = './sources/' + files[i];
    //     let file = fs.readFileSync(filePath).toString().split('\n');
    //     for(let i=0;i<=datas[file[0]].length;i++){
    //            if(word == datas[file[0]][i].English) {
    //              flag = true;
    //              req.flash('success', datas[file][i].Chinese);
    //              res.redirect('/user/select');
    //     }
    //     break;
    // }
    //     if(flag=true)
    //         break;
    //     }
    // if(flag=false){
    //     req.flash('success', "未找到单词");
    //     res.redirect('/user/select');
    // }
    let files = fs.readdirSync('./sources');
    for (let i in files) {
        let filePath = './sources/' + files[i];
        let file = fs.readFileSync(filePath).toString().split('\n');
        let words = [];
        // console.log(file);
        // console.log(file.length);
        for (let i = 1; i < file.length; i++) {
            let t = file[i].split('----');
            if (word == t[0]) {
                req.flash('success', t[1]);
                res.redirect('/user/select');
                flag = true;
                return;
            }
            if (flag == true)
                break;
        }
        if (flag == true)
            break;
    }
    if (flag == false) {
        req.flash('error', "未找到单词");
        res.redirect('/user/select');
    }

});

//单词本
router.get('/notebook', (req, res) => {
    // Words.deleteMany({ word: 'q' }, () => {
    //     console.log('delete');
    // });
    Words.find((err, word) => {
        console.log(word);
        res.render('user/notebook', {
            error: req.flash('error'),
            success: req.flash('success'),
            user: req.user,
            words: word
        });
    })
});


router.post('/notebook', (req, res) => {
    let words = req.body.word;
    let mean = req.body.mean;
    let Pos = req.body.Pos;
    let word = new Words({
            word: words,
            mean: mean,
            Pos: Pos
        })
        // word.save();
});
module.exports = router;