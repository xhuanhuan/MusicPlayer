var https = require('https');
var fs = require('fs');
var url=require('url');
var options = {
	key: fs.readFileSync('./xhuanhuan.cn/Nginx/2_xhuanhuan.cn.key'),
	cert: fs.readFileSync('./xhuanhuan.cn/Nginx/1_xhuanhuan.cn_bundle.crt')
};
// 创建服务器

var options2 = {
    hostname: 'music.qq.com',
        path: '/musicbox/shop/v3/data/hit/hit_all.js',
        method: 'GET'
};

https.createServer(options,function(req, res){
	 	res.writeHead(200, {'Content-Type': 'text/html; charset=gbk','Access-Control-Allow-Origin':'*'});
	 		//发送请求歌曲榜单
		var req2 = https.request(options2,function(res2){
		    res2.on('data',function(chunk){
		        var returnData = chunk;//如果服务器传来的是json字符串，可以将字符串转换成json
		        res.write(returnData);
		    });
		    res2.on('end',function(){
	 			console.log('相应结束');
	 			res.end();
		    });
		});
		//如果有错误会输出错误
		req2.on('error', function(e){
		      res.write('错误：' + e.message);
		      res.end();
		});
		req2.end();
	

}).listen(443);

// 控制台会输出以下信息
console.log('Server is running at port:443');
