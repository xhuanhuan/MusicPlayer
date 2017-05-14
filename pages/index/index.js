//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    id: "",
    id_last2:"",
    imgId:"",
    songName:"",
    Lyric:[],
    Lyric_index:0,
    time:{},
    time_total_str:"",
    passed_str:"00:00",
    bar_width:0,
    current:20,
    pause:true,
    play_pause_src:'./img/play.png',
    animation_pause:'animation-play-state:paused',
    userInfo: {},
    timer:null,
    touches:{},
    mode:{
      mode_img:['./img/shunxu.png','./img/singlemusic.png','./img/random.png'],
      index:0
    },
    songList:[],
    songList_show:"none"
  },
  //事件处理函数
  bindViewTap: function() {
    if(this.data.songList_show=="none"){
        wx.navigateTo({
      url: '../logs/logs'
    })
    }
  },
  modeChoose:function(){
    var mode=this.data.mode
    mode.index++
    if(mode.index>=3){
      mode.index=0
    }
    this.setData({
      mode:mode
    })
  },
  mytouchstart:function(e){
    console.log(e.touches[0].pageX)
     this.setData({
       touches:{
         startPos:e.touches[0].pageX,
         startTime:this.data.time.passed,
         move:0
       }
     })
     console.log("startPos:"+e.touches[0].pageX)
  },
  mytouchmove:function(e){
    var touches=this.data.touches
    touches.move=e.touches[0].pageX-touches.startPos
    var time=this.data.time
    time.passed=touches.startTime+parseInt(touches.move/190*time.total)
    if(time.passed<0){
      time.passed=0
    }else if(time.passed>time.total){
      time.passed=time.total
    }
      // console.log("pageX:"+e.touches[0].pageX)
      //  console.log("move:"+touches.move)
      //  console.log("passed time:"+time.passed)
       this.setData({
          touches:touches,
          time:time,
          bar_width:190*(time.passed)/time.total,
          passed_str:this.getTimeStr(time.passed),
      })
    
    //console.log(e.touches[0])
  },
  mytouchend:function(){
    var Lyric=this.data.Lyric
    // var Lyric_index=this.data.index
    var time=this.data.time
    var that=this
    Lyric.forEach(function(item,index){
      if(index<Lyric.length-1&&item.time<=time.passed&&Lyric[index+1].time>time.passed){
        console.log(index)
        that.setData({
          Lyric_index:index
        })
      }
    })
    this.audiopassed()
  },


  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    // app.getUserInfo(function(userInfo){
    //   //更新数据
    //   that.setData({
    //     userInfo:userInfo
    //   })
    // })
    app.getMusicInfo(function(musicInfo){
      var total=parseInt(app.globalData.musicInfo[that.data.current].playTime)
      var songList=app.globalData.musicInfo.map(function(item){
        return item.songName
      })
      // console.log(songList)
      that.setData({
        id:app.globalData.musicInfo[that.data.current].id,
        imgId:app.globalData.musicInfo[that.data.current].albumId,
        id_last2:app.globalData.musicInfo[that.data.current].albumId%100,
        songName:app.globalData.musicInfo[that.data.current].songName,
        time:{
          passed:0,
          total:total
        },
        songList:songList,
        time_total_str:that.getTimeStr(total)
      })
      //  console.log('last2:'+that.data.id_last2)
      //  console.log('id:'+that.data.id%100)
      //获取歌词
      that.setLyricSRC(that.data.id)
    })


  },
  onReady: function () {
    console.log('onReady');
    // 使用 wx.createAudioContext 获取 audio 上下文 context
     this.audioCtx = wx.createAudioContext('myAudio')
    // this.audioCtx.setSrc("http://ws.stream.qqmusic.qq.com//"+this.data.id+".m4a?fromtag=46")
  },
  setLyricSRC:function(id){
    var srcUrl='https://music.qq.com/miniportal/static/lyric/'+id%100+'/'+id+'.xml'
    var that=this
    wx.request({
      url: srcUrl, 
      data: "",
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        var Lyric=that.data.Lyric
        var data=res.data
         console.log(res)
         if(res.statusCode>='200'&&res.statusCode<='300'){
            data.replace(/(\d+):(\d+).\d+]([\u4e00-\u9fa5\s：《》]+)/g,function($1,$2,$3,$4){
            var o={}
            o.time=parseInt($2)*60+parseInt($3)
            o.Lyric=$4
            if(Lyric.length>0&&(Lyric[Lyric.length-1].time==o.time)){
               Lyric[Lyric.length-1].Lyric=Lyric[Lyric.length-1].Lyric+" "+o.Lyric
            }else{
               Lyric.push(o)
            }
          })
      //  console.log(Lyric)
         that.setData({
           Lyric:Lyric
          })
         }else{
           that.setData({
           Lyric:[{
             time:0,
             Lyric:'未查询到歌词'
           }]
          })
         }
       
      },
      fail: function(){
        console.log('没有查询到歌词')
      }
    })
  },
   audioPlay: function () {
     this.setData({
      pause:!this.data.pause
     })
     if(this.data.pause){
       this.setData({
         play_pause_src:'./img/play.png',
         animation_pause:'animation-play-state:paused'
       })
    }else{
       this.setData({
         play_pause_src:'./img/pause.png',
         animation_pause:'animation-play-state:running'
       })
    }
    var timer
    var that=this
     if(this.data.pause){
        this.audioCtx.pause()
        clearInterval(this.data.timer) 
        this.setData({
          timer:null
        })
     }else{
        this.audioCtx.play() 
        var Lyric=that.data.Lyric
        this.setData({
          timer:setInterval(function(){
          var time=that.data.time
          var Lyric_index=that.data.Lyric_index
          if(time.passed<time.total-1){
            time.passed+=1
            // console.log(Lyric[Lyric_index+1])
            if(Lyric_index<Lyric.length-1&&(Lyric[Lyric_index+1].time===time.passed)){
              that.setData({
                Lyric_index:Lyric_index+1,
                time:time,
                passed_str:that.getTimeStr(time.passed),
                bar_width:190*(time.passed)/time.total
            })
            }else{
              that.setData({
                time:time,
                passed_str:that.getTimeStr(time.passed),
                bar_width:190*(time.passed)/time.total
            })
            }
      
          }else{
            clearInterval(that.data.timer)
             that.setData({
              timer:null,
              bar_width:0
            })
            that.audioNext()
          }
        },1000) 
        })
     } 
  },
 audiopassed: function () {
   var time=this.data.time
    this.audioCtx.seek(time.passed)
  },
  audioNext: function () {
    clearInterval(this.data.timer)
    var current=this.data.current
    var mode_index=this.data.mode.index
    if(mode_index==0){
      current=current+1>=app.globalData.musicInfo.length?0:current+1
    }else if(mode_index==2){
      current=parseInt(Math.random()*100)
    }
  this.setData({
    Lyric:[],
    Lyric_index:0,
    current:current,
    pause:true,
    play_pause_src:'./img/play.png',
    id:app.globalData.musicInfo[current].id,
    imgId:app.globalData.musicInfo[current].albumId,
    id_last2:app.globalData.musicInfo[current].albumId%100,
    songName:app.globalData.musicInfo[current].songName, 
    time:{
          passed:0,
          total:parseInt(app.globalData.musicInfo[current].playTime)
        },
     bar_width:0,
     passed_str:"00:00",
     timer:null,
     time_total_str:this.getTimeStr(parseInt(app.globalData.musicInfo[current].playTime)),
    animation_pause:'animation-play-state:running'
  })
  this.audioCtx.seek(0)
  var that=this;
   setTimeout(function(){that.audioPlay()},300)
   this.setLyricSRC(this.data.id)
  },

  audioPre: function () {
    clearInterval(this.data.timer)
    var current=this.data.current
    if(this.data.mode.index==0){
    current=current-1<0?  app.globalData.musicInfo.length-1:current-1
    }else if(this.data.mode.index==2){
      current=parseInt(Math.random()*100)
    }
    this.setData({
      Lyric:[],
      Lyric_index:0,
      current:current,
      pause:true,
      play_pause_src:'./img/play.png',
      id:app.globalData.musicInfo[current].id,
      imgId:app.globalData.musicInfo[current].albumId,
      id_last2:app.globalData.musicInfo[current].albumId%100,
      songName:app.globalData.musicInfo[current].songName,
      time:{
          passed:0,
          total:parseInt(app.globalData.musicInfo[current].playTime)
        },
      bar_width:0,
      passed_str:"00:00",
      timer:null,
      time_total_str:this.getTimeStr(parseInt(app.globalData.musicInfo[current].playTime)),
      animation_pause:'animation-play-state:running'
    })
    this.audioCtx.seek(0)
    var that=this
     setTimeout(function(){that.audioPlay()},300)
     this.setLyricSRC(this.data.id)
  },
  getTimeStr:function(total){
      var miao=total%60
      var fen=(total-miao)/60
      var time_total_str=""
      if(fen<10){
        time_total_str=time_total_str+'0'+fen.toString()+':'
      }else{
        time_total_str=time_total_str+fen.toString()+':'
      }
      if(miao<10){
        time_total_str=time_total_str+'0'+miao.toString()
      }else{
         time_total_str=time_total_str+miao.toString()
      }
      return time_total_str
  },
  showlist:function(e){
      this.setData({
        songList_show:"block"
      })
  },
  closeList:function(){
     this.setData({
        songList_show:"none"
      })
  },
  songChoose:function(e){
     clearInterval(this.data.timer)
    var current=e.target.dataset.nth
    this.setData({
    Lyric:[],
    Lyric_index:0,
    current:current,
    pause:true,
    play_pause_src:'./img/play.png',
    id:app.globalData.musicInfo[current].id,
    imgId:app.globalData.musicInfo[current].albumId,
    id_last2:app.globalData.musicInfo[current].albumId%100,
    songName:app.globalData.musicInfo[current].songName, 
    time:{
          passed:0,
          total:parseInt(app.globalData.musicInfo[current].playTime)
        },
    bar_width:0,
    passed_str:"00:00",
    timer:null,
    time_total_str:this.getTimeStr(parseInt(app.globalData.musicInfo[current].playTime)),
    animation_pause:'animation-play-state:running',
    songList_show:"none"
  })
  this.audioCtx.seek(0)
   var that=this;
   setTimeout(function(){that.audioPlay()},300)
   this.setLyricSRC(this.data.id)
  }

})
