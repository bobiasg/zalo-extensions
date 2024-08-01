/*
{
    "avatar": "",
    "bgavatar": "",
    "creatorId": "4562361980058390334",
    "desc": "",
    "displayName": "Project - STARACK-META23",
    "isGroup": true,
    "topMember": [
        {
            "avatar": "https://s120-ava-talk.zadn.vn/8/c/2/6/7/120/16cc8a2d6a42bd7289bcbd8ac50df694.jpg",
            "dName": "Henry Nguyen",
            "id": "4562361980058390334"
        },
        {
            "avatar": "https://s120-ava-talk.zadn.vn/3/2/9/e/20/120/504d4f73c53907599f928e2df1f2831e.jpg",
            "dName": "Mr Tú Dtx",
            "id": "871852439786403191"
        },
        {
            "avatar": "https://s120-ava-talk.zadn.vn/2/e/c/7/2/120/808616df2e224da3a84220e7a5d96393.jpg",
            "dName": "Khuong Nguyen",
            "id": "2222357829589985721"
        },
        {
            "avatar": "https://s75-ava-talk.zadn.vn/c/5/5/9/3/75/b55780dc1ff747ea91642682dba09bd9.jpg",
            "dName": "Quang Duy",
            "id": "6970339324697443285"
        }
    ],
    "totalMember": 5,
    "type": 1,
    "userId": "g318037300188269831",
    "visibility": 0,
    "lastUpdate": 1719365627749,
    "memberIds": [
        "4562361980058390334",
        "871852439786403191",
        "2222357829589985721",
        "6970339324697443285",
        "4525779557820846240"
    ],
    "version": "1719325485239",
    "e2ee": 0,
    "subType": 1,
    "globalId": "35NG69B4FJA5SPLB763UQ3AIH3KJ1580"
}
*/
export interface ZaloGroup {
  avatar?: string;
  bgavatar?: string;
  creatorId?: string;
  desc?: string;
  displayName?: string;
  isGroup?: boolean;
  topMember?: {
    avatar?: string;
    dName?: string;
    id?: string;
  }[];
  totalMember?: number;
  type?: number;
  userId?: string;
  visibility?: number;
  lastUpdate?: number;
  memberIds?: string[];
  version?: string;
  e2ee?: number;
  subType?: number;
  globalId?: string;
}
