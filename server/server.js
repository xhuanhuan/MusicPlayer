var https = require('https');
var fs = require('fs');

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

	var returnData="";
		//发送请求
	var req2 = https.request(options2,function(res2){
	     // res2.setEncoding('utf8')
	    res2.on('data',function(chunk){
	        returnData = chunk;//如果服务器传来的是json字符串，可以将字符串转换成json
	        res.write(returnData);
	           res.end();
	        // console.log(returnData);
	    });
	});
	//如果有错误会输出错误
	req2.on('error', function(e){
	      res.write('错误：' + e.message);
	      res.end();
	});
	req2.end();

// 	https.get('https://music.qq.com/musicbox/shop/v3/data/hit/hit_all.js',function(req2,res2){  
//     var html='';  
//     req2.on('data',function(data){  
//         html+=data;  
//     });  
//     req2.on('end',function(){  
//     	returnData=html;
//     	res.write(returnData);
//         res.end(); 
//     });  
// });
 

}).listen(443);

// 控制台会输出以下信息
console.log('Server is running at port:443');
