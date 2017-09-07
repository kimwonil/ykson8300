var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);



app.get('/', function(req, res){
	  res.sendFile(__dirname + '/indexBefore.html');
	});

app.get('/chch', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});



var userList = [];


io.on('connection', function(socket){
  var joinedUser = false;
  var nickname;

  // 유저 입장
  socket.on('join', function(data){
    if (joinedUser) { // 이미 입장 했다면 중단
      return false; 
    }

    nickname = data;
    userList.push(nickname);//채팅참여자 리스트에 넣고
    socket.broadcast.emit('join', { //모든 사람들한테 oo님이 입장했습니다 쓰기
      nickname : nickname
      ,userList : userList
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

    socket.broadcast.emit('left', { 
      nickname : nickname 
      ,userList : userList
    });    
  });
});


