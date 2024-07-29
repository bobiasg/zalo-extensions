/*
  {
    "userId": "48410417527950277",
    "username": "t_m7e0988am6",
    "displayName": "Nguyễn Đức Toàn",
    "zaloName": "Nguyễn Đức Toàn",
    "avatar": "https://s120-ava-talk.zadn.vn/2/b/e/6/13/120/d51f153bb48df4cd21b003abef9750e4.jpg",
    "bgavatar": "",
    "cover": "https://cover-talk.zadn.vn/b/5/8/2/1/d51f153bb48df4cd21b003abef9750e4.jpg",
    "gender": 0,
    "dob": 619117200,
    "sdob": "15/08/1989",
    "status": "Nhận Ký Gửi Bất Động Sản Nha Trang\nSĐT: 0905048022\nZalo: 0905048022",
    "phoneNumber": "",
    "isFr": 1,
    "isBlocked": 0,
    "lastActionTime": 1719630705626,
    "lastUpdateTime": 1719504511,
    "isActive": 1,
    "key": 0,
    "type": 0,
    "isActivePC": 1,
    "isActiveWeb": 0,
    "isValid": 1,
    "userKey": "48410417527950277",
    "accountStatus": 0,
    "oaInfo": null,
    "user_mode": 0,
    "globalId": "FIT0EATU7RQO9F3HSC1OIBJGFB6R7B00",
    "createdTs": 1430033252,
    "bizInfo": {
        "label": {
            "VI": "Business",
            "EN": "Business"
        },
        "pkgId": 1
    }
  }
*/
export interface ZaloUser {
  userId?: string;
  username?: string;
  displayName?: string;
  zaloName?: string;
  avatar?: string;
  bgavatar?: string;
  cover?: string;
  gender?: number;
  dob?: number;
  sdob?: string;
  status?: string;
  phoneNumber?: string;
  isFr?: number;
  isBlocked?: number;
  lastActionTime?: number;
  lastUpdateTime?: number;
  isActive?: number;
  key?: number;
  type?: number;
  isActivePC?: number;
  isActiveWeb?: number;
  isValid?: number;
  userKey?: string;
  accountStatus?: number;
  oaInfo?: unknown;
  user_mode?: number;
  globalId?: string;
  createdTs?: number;
  bizInfo?: {
    label?: {
      VI?: string;
      EN?: string;
    };
    pkgId?: number;
  };
}
