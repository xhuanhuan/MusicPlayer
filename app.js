//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  getMusicInfo:function(id){
    var that=this
    wx.request({
      url: 'https://xhuanhuan.cn', 
      data: "",
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //console.log(res.data)
         var arr1=[]
         var arr2=[]
         var arr3=[]
         res.data.replace(/id:"(\d+)"/g,function($1,$2)                   {
            arr1.push($2)
         }).replace(/songName:"([^"]+)"/g,function($1,$2)                 {
            arr2.push($2)
         }).replace(/playtime:"(\d+)"/g,function($1,$2)                   {
            arr3.push($2)
         })
         var arr=[].map.call(arr1,function(item,index){
          var o={}
          o.id=item
          o.songName=arr2[index]
          o.playTime=arr3[index]
          return o;
         })
         arr1=null
         arr2=null
         arr3=null
        //  console.log(arr)
         that.globalData.musicInfo=arr
         typeof id == "function" && id(that.globalData.userInfo)
      },
      fail: function(err){
        console.log(err)
      }
    })
  },
  globalData:{
    userInfo:null,
    musicInfo:[]
  }
})