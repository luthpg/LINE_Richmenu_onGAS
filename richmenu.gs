//以下の定数を前提としている
//同じスクリプトプロジェクト内に記述

const url_richmenu = 'https://api.line.me/v2/bot/richmenu';
const url_richmenu_data = 'https://api-data.line.me/v2/bot/richmenu/';
const url_user = 'https://api.line.me/v2/bot/user';

//以下にLINE MessagingAPIのアクセストークンを記述
const access_token = { /*LINE Developers アクセストークン*/ };

/**
 * リッチメニューを作成し、固有IDを返す
 * タップ領域は、全体2500*1686px、6分割での例
 * また、タップ領域のサイズ・アクション例を2つ載せている
 * 
 * @return {string} - LINEから返されたリッチメニュー固有のID
 */
function makeRichmenu_largeSize() {
  const url = url_richmenu;

  const areas = [];

  //タップ領域の例　その1
  let now = new Date();
  const time = Utilities.formatDate(now, 'JST', "HH:mm");
  const nextYear = now.setFullYear(now.getFullYear() + 1);
  
  areas[0] = {

    //領域の大きさ
    'bounds': {

      //左から0px地点から
      'x': 0,

      //上から0px地点から
      'y': 0,

      //幅833px
      'width': 833,

      //高さ843px
      'height': 843
    },

    //ユーザがタップ時のアクション
    'action': {
      //メッセージアクション
      'type': 'message',

      //ユーザがタップ時に、botへ送信する内容
      'text': 'おなかすいた、もう' + time + 'だよー',
    }
  };

  areas[1] = {　/*...*/ };
  areas[2] = {　/*...*/ };
  areas[3] = {　/*...*/ };
  areas[4] = {　/*...*/ };

  //タップ領域の例　その2
  areas[5] = {

    //領域の大きさ
    'bounds': {

      //左から1666px地点から
      'x': 1666,

      //上から843px地点から
      'y': 843,

      //幅834px
      'width': 834,

      //高さ843px
      'height': 843,
    },

    //ユーザがタップ時のアクション
    'action': {

      //日時選択アクション
      'type': 'datetimepicker',

      //ユーザがタップ時に、botへ送信するポストバックイベントとしてのラベル
      //GAS側で検索キーとして利用できる
      'data': 'keyword',

      //モード　datetimeで「日付+時間」
      'mode': 'datetime',

      //（省略可）初期値　形式は"YYYY-MM-dd'T'HH:mm"で
      'initial': Utilities.formatDate(now, 'JST', "YYYY-MM-dd'T'HH:mm"),

      //（省略可）許容する最大値　形式は"YYYY-MM-dd'T'HH:mm"で
      'max': Utilities.formatDate(nextYear, 'JST', "YYYY-MM-dd'T'HH:mm"),

      //（省略可）許容する最小値　形式は"YYYY-MM-dd'T'HH:mm"で
      'min': Utilities.formatDate(now, 'JST', "YYYY-MM-dd'T'HH:mm"),
    }
  };

  const postData = {

    //タップ領域全体のサイズ
    'size': {

      //幅2500pxで
      'width': 2500,

      //高さ1686pxで
      'height': 1686,
    },

    //デフォルトのリッチメニューにするかどうか
    'selected': false,

    //リッチメニュー管理用の名前　ユーザには非公開
    'name': { /*リッチメニュー名*/ },

    //トークルームメニューに表示されるテキスト
    'chatBarText': { /*メニュー*/ },

    //タップ領域群
    'areas': areas,
  }

  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + access_token,
  }

  const options = {
    'method': 'post',
    'headers': headers,
    'payload': JSON.stringify(postData),
  }

  let json = UrlFetchApp.fetch(url, options);
  json = JSON.parse(json);
  return json.richMenuId;
}

/**
 * MessagingAPIから作成したリッチメニューを取得
 * 
 * @return {Object[]} - 取得したリッチメニュー一覧
 */
function getRichmenus() {
  const url = url_richmenu + '/list';

  const headers = {
    'Authorization': 'Bearer ' + access_token,
  };

  const options = {
    'method': 'get',
    'headers': headers,
  };

  let json = UrlFetchApp.fetch(url, options);
  json = JSON.parse(json);
  return json.richmenus;
}

/**
 * 作成済リッチメニューに画像ファイルを紐づけ
 * GoogleDriveに格納している画像ファイルを、PNGファイルとしてアップロードする例
 * 
 * @param {string} richmenuId - リッチメニュー固有のID
 * @param {string} drive_fileId - GoogleDriveのファイルID
 * @return {Object} - 結果
 */
function setImage_Richmenu(richmenuId, drive_fileId) {
  const url = url_richmenu_data + '/' + richmenuId + '/content';

  //GoogleDriveからファイルIDで画像ファイルを開く
  const image = DriveApp.getFileById(drive_fileId);

  //開いた画像ファイルをPNG形式・BLOBに変換
  const blob = image.getAs(MimeType.PNG);

  const headers = {
    'Content-Type': 'image/png',
    'Authorization': 'Bearer ' + access_token,
  };

  const options = {
    'method': 'post',
    'headers': headers,

    //payloadにBLOBをそのまま乗せる
    'payload': blob,
  };

  let json = UrlFetchApp.fetch(url, options);
  json = JSON.parse(json);
  return json;
}

/**
 * リッチメニューを特定のユーザ1人にセット、即時で反映される
 * 
 * @param {string} uid - LINEユーザ固有のID
 * @param {string} richmenuId - リッチメニュー固有のID
 * @return {Object} - 結果
 */
function setRichmenu_toOneUser(uid, richmenuId) {
  const url = url_user + '/' + uid + '/richmenu/' + richmenuId;

  const headers = {
    'Authorization': 'Bearer ' + access_token,
  };

  const options = {
    'method': 'post',
    'headers': headers,
  };

  let json = UrlFetchApp.fetch(url, options);
  json = JSON.parse(json);
  return json;
}

/**
 * 特定のユーザ1人にセットされているリッチメニューを取得
 * 
 * @param {string} uid - LINEユーザ固有のID
 * @return {string} - 紐付いているリッチメニューID
 */
function getRichmenu_ofOneUser(uid) {
  const url = url_user + '/' + uid + '/richmenu/';

  const headers = {
    'Authorization': 'Bearer ' + access_token,
  };

  const options = {
    'method': 'get',
    'headers': headers,
  };

  let json = UrlFetchApp.fetch(url, options);
  json = JSON.parse(json);
  return json.richMemuId;
}

/**
 * 特定のユーザ1人にセットしているリッチメニューを解除、即時で反映される
 * 
 * @param {string} uid - LINEユーザ固有のID
 * @return {Object} json - 結果
 */
function releaseRichmenu_fromUser(uid) {
  const url = url_user + '/' + uid + '/richmenu';

  const headers = {
    'Authorization': 'Bearer ' + access_token,
  };

  const options = {
    'method': 'delete',
    'headers': headers,
  };

  let json = UrlFetchApp.fetch(url, options);
  json = JSON.parse(json);
  return json;
}

/**
 * リッチメニューを削除
 * 特定ユーザに紐づけている場合は、ユーザが再度トークルームに入室した際に反映
 * 
 * @param {string} richmenuId - リッチメニュー固有のID
 * @return {Object} json - 結果
 */
function deleteRichmenu(richmenuId) {
  const url = url_richmenu + '/' + richmenuId;

  const headers = {
    'Authorization': 'Bearer ' + access_token,
  };

  const options = {
    'method': 'delete',
    'headers': headers,
  };

  let json = UrlFetchApp.fetch(url, options);
  json = JSON.parse(json);
  return json;
}
