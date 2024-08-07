1. Receive messages:
  1.1 Cơ chế giao tiếp sử dụng messaging, cần đăng ký nhận message để xử lý:

  window.addEventListener('message', event => {
    const eventData = event.data;

    /* example
    {
    "source": "zalo_extension",
    "action": "zaloReceivedMessage",
    "message": {
        "fromUser": {
        },
        "toUser": {
            "userId": "7842608052775262904",
            "username": "t_m7enngaz8z",
            "displayName": "Nguyen Thanh Truong",
            "zaloName": "Nguyễn Thanh Trường",
            "avatar": "https://s120-ava-talk.zadn.vn/a/1/c/c/2/120/dd5c642657520c94dd108fc415dbb325.jpg",
            "bgavatar": "",
            "cover": "https://cover-talk.zadn.vn/2/7/0/d/2/dd5c642657520c94dd108fc415dbb325.jpg",
            "gender": 0,
            "dob": 411843600,
            "sdob": "20/01/1983",
            "status": "",
            "phoneNumber": "84948832001",
            "isFr": 1,
            "isBlocked": false,
            "lastActionTime": 1722925894987,
            "lastUpdateTime": 1714041600,
            "isActive": 1,
            "key": 0,
            "type": 0,
            "isActivePC": 1,
            "isActiveWeb": 1,
            "isValid": 1,
            "userKey": "7842608052775262904",
            "accountStatus": 0,
            "oaInfo": null,
            "user_mode": 0,
            "globalId": "RBM962DK8FV8TDK7T5NQ39TTK376FJO0",
            "createdTs": 0,
            "bizInfo": {
                "label": null,
                "pkgId": 0
            },
            "lastOnlineTime": 1722915445966
        },
        "zaloMessage": {
            "msgId": "5703700701259",
            "zglobalMsgId": "5703700701259",
            "cliMsgId": "1722916145534",
            "msgType": 1,
            "status": 2,
            "notify": "1",
            "message": "để chiều nay a làm xong rồi gởi luôn.",
            "sendDttm": "1722916145536",
            "serverTime": "1722916146219",
            "fromUid": "0",
            "toUid": "7842608052775262904",
            "dName": "Khuong Nguyen",
            "localDttm": 1722916146230,
            "properties": {
                "color": 0,
                "size": 0,
                "type": 0,
                "subType": 0,
                "ext": "{\"shouldParseLinkOrContact\":0}"
            },
            "ttl": 0,
            "st": 3,
            "at": 5,
            "cmd": 501,
            "originMsgType": "webchat",
            "subState": -1,
            "e2eeStatus": -1,
            "platformType": 1,
            "src": 10,
            "syncFromMobile": false,
            "topOut": "0",
            "topOutTimeOut": "0",
            "topOutImprTimeOut": "0"
              }
          }
      }

    */ 

    // Check the event origin
    if (eventData?.source !== 'zalo_extension') {
      return;
    }

    //console.debug('Response from proxy script: eventData =', eventData);

    // this is zalo received message event
    if (eventData.action === 'zaloReceivedMessage') {
      const message = eventData.message;
      // process it
      // ........

    }
  });

  1.2 Sử dụng helper function: zaloAddReceiveMessageListener

  Hàm zaloAddReceiveMessageListener sử dụng để đăng ký nhận zalo message.

  window.zaloAddReceiveMessageListener(message => console.log(message));

2. Send message
  2.1 Cơ chế giao tiếp sử dụng messaging, sử dụng postMessage để gởi yêu cầu và đăng ký nhận message để xử lý kết quả:

  Gởi message:
    window.postMessage({ 
              source: 'zalo_extension',
              action: 'zaloSendRequest',
              message: {
                type: 'send-message',
                data: {
                  phone: '0948832001',
                  message: 'This is message',
                },
                requestId: '0948832001',
           } }, '*');

  Đăng ký để xử lý message nhận về:
    window.addEventListener('message', event => {
      const eventData = event.data;  

      /* example eventData
      {
          "source": "zalo_extension",
          "action": "zaloSendResult",
          "message": {
              "error": false,
              "message": null,
              "user": {
                  "userStatus": "friend",
                  "userInfo": {
                      "userId": "7842608052775262904"
                  }
              },
              "zaloMessage": {
                  "type": "send-message",
                  "data": {
                      "phone": "0948832001",
                      "message": "This is message"
                  },
                  "requestId": "0948832001"
              }
          }
      }
      */

      // Check the event origin
      if (eventData?.source !== 'zalo_extension') {
        return;
      }

      // this is result of send message event
      if (eventData.action === 'zaloSendResult') {
        const message = eventData.message;
        // process it
        // ........
      }

    });

  2.2 Xử dụng helper function: zaloSendMessage
     window
      .zaloSendMessage({
        data: {
          phone: '0948832001',
          message: message,
        },
        requestId: '0948832001',
      })
      .then(result => console.log(result))
      .catch(err => console.log(err));


3. Add Friend
  Giống 2), type: 'send-message' --> type: 'request-friend'

  3.2 Xử dụng helper function: zaloAddFriend
    window
      .zaloAddFriend({
        data: {
          phone: '0948832001',
          message: message,
        },
        requestId: '0948832001',
      })
      .then(result => console.log(result))
      .catch(err => console.log(err));