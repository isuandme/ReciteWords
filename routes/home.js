const express = require('express');//导入express模块
const router = express.Router();//创建路由容器
const data = require('./../config/testdata');//导入./../config/testdata文件

router.get('/', (req, res) => {
    // console.log(req.user);
    // console.log(data);
    res.render('home', {
        user: req.user,//登录用户的相关信息 包括已通关的单元、用户名、密码
        data: data,//后台的英文单词及中文意思的所有数据
        success: req.flash('success')
    });//第一个参数是视图的名称，如果是.ejs文件，必须省略后缀名，如果是.html,.jsp,.abc,.def等自己定义的后缀名时，必须加后缀。第二个参数是视图需要的数据 该函数用于对服务器进行渲染
});

module.exports = router;//公开模块