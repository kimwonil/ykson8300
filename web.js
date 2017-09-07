var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var url = require('url');

var nick;//닉네임
var admin;//관리자 여부



app.get('/', function(req, res){
	
	var uri = req.url;
	var query = url.parse(uri, true).query;

	if(req.method == 'GET') { 

		res.sendFile(__dirname + '/index.html');
//		console.log(query.nickname);
		nick=query.nickname;
		admin=query.admin;
	}
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});



var userList = [];
var guest = [];//회원이 아닌 손님들 리스트
var guestNum ;//손님번호


io.on('connection', function(socket){
//	console.log(socket.sockets);
  var joinedUser = false;
  if(admin==1){
	  var nickname=nick+'(관리자)';
  }else{
	  var nickname=nick;
  }
  
  console.log("시작");
  console.log(nickname);
  
  if(nickname=="" ){//닉네임이 비어있으면 손님에 넣어줄거야
	var num=1;//비교할 번호
	var emptyNo;//이미 있는 손님 번호(마지막 또는 구멍 직전)
	  
	  //배열굴려서 빈구멍 또는 마지막 번호 찾기
	  guest.forEach(function(item, index){
		  emptyNo = parseInt(guest[index].substr(2));
		  if(num == emptyNo){
			  num++;
		  }else{
			  return
		  }
	  });//forEach문 끝
	  

	  var num2 = parseInt(num)-1;
	  guest.splice(num2, 0, "손님"+num);
	  nickname = "손님"+num;
	  num=1;
  }
  
  // 유저 입장
  socket.on('join', function(){
    if (joinedUser) { // 이미 입장 했다면 중단
      return false; 
    }

//    nickname = nick;
    userList.push(nickname);//채팅참여자 리스트에 넣고
    socket.broadcast.emit('join', { //모든 사람들한테 oo님이 입장했습니다 쓰기
      nickname : nickname
      ,userList : userList,
    });

    socket.emit('welcome', { //입장한 사람한테 oo님 환영합니다 보내기
      nickname : nickname
      ,userList : userList
    });

    joinedUser = true;
  });


  // 메시지 전달
  socket.on('msg', function(data){ //메시지가 들어오면 nickname : blahblah 보내기
    console.log('msg: ' + data);
    io.emit('msg', { 
      nickname : nickname
      ,msg : data
    });

  });


  // 접속 종료
  socket.on('disconnect', function () {//채팅 나가면
    // 입장하지 않았다면 중단
    if ( !joinedUser) { 
      console.log('--- not joinedUser left'); 
      return false;
    }

    // 접속자목록에서 제거
    var i = userList.indexOf(nickname);
    userList.splice(i,1);
    
    var j = guest.indexOf(nickname);
    if(j != -1){
	    guest.splice(j, 1);
	    console.log(guest);
    }
    
    socket.broadcast.emit('left', { 
      nickname : nickname 
      ,userList : userList
    });    
  });
});


