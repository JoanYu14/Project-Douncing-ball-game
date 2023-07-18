const canvas = document.getElementById("myCanvas");
const canvasHeight = canvas.height;
const canvasWidth = canvas.width;
// getContext("2d")回傳的就是CanvasRenderingContext2D
const ctx = canvas.getContext("2d");
let circle_x = 160; // 設定球的圓心在x為160的位置
let circle_y = 60; // 設定球的圓心在y為60的位置
let radius = 20; // 設定球的半徑為20
let xSpeed = 20; // 設定球的x座標每0.025秒移動20
let ySpeed = 20; // 設定球的y座標每0.025秒移動20

// 設定ground初始資料
let groundHeight = 5; // 設定ground高度
let groundWeith = 200; // 設定ground寬度
let ground_x = 100; // 設定ground的x座標(後面會根據游標位置移動)
let ground_y = 500; // 設定ground的y座標(固定)

// =====================================================================================================================================================
// brick相關

// brick設定
let brickArray = []; // 存放所有brick的陣列
let count = 0; // 存已被打到幾個brick

class Brick {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    // 只要每用Brick製作一個物件時，就把這個物件新增到brickArray的最後面
    brickArray.push(this);

    // 所有創建的物件都是可見的
    this.visible = true;
  }

  // 畫出brick的method(每個用Brick製作的物件都會有此method)
  drawBrick() {
    ctx.fillStyle = "lemonchiffon";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  // 定義確認是否有被球打到的method
  touchingBall(ballX, ballY) {
    // return是否在這個brick會被球打到的區間內
    return (
      ballX >= this.x - radius &&
      ballX <= this.x + this.width + radius &&
      ballY <= this.y + this.height + radius &&
      ballY >= this.y - radius
    );
  }
}

// 定義取min~max之間整數的function
// 例:max=500 min=100
// Math.random會從0~1之間(不包括)隨機取一個值，把這個值乘上max-min(400)就能得到一個400內的值
// 然後對這個值做無條件捨去小數位
// 所以min加上這個值就會為500內的值
function getRandomArbitrary(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

// 製作所有brick
for (let i = 0; i < 10; i++) {
  // x座標，因為canvas的寬為1000，所以要減掉brick的寬度才不會超出右邊界(因為canvas是以左上角為原點往右下畫)
  // x座標，因為canvas的長為600，所以要減掉brick的長度才不會超出下邊界(因為canvas是以左上角為原點往右下畫)
  new Brick(getRandomArbitrary(0, 950), getRandomArbitrary(0, 550));
}

// =====================================================================================================================================================

// 在canvas區域內監聽游標移動事件，游標移動所製作的event object(e)裡面有一個屬性叫做clientX，此屬性的值就是你移動到哪個x座標
canvas.addEventListener("mousemove", (e) => {
  // 當你的游標移動時ground的x座標就要被游標移動到的x座標代替
  ground_x = e.clientX;
});

function drawCircle() {
  // 因為上一次畫的結果並不會被清除，會疊加
  // 所以我們每進行一次drawCircle我們就要把畫布用黑色填滿一次(下兩行)，不然蛇的身體不管有沒有吃到果實會一直變長
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 確認是否有打到brick================================================================================
  // forEach的callback function內第一個參數預設是目前訪問的陣列元素，第二個參數就是此元素的index
  brickArray.forEach((brick) => {
    // 如果目前訪問的brick他的visible屬性還是true且使用touchingBall函式回傳為true的話就執行以下
    if (brick.visible && brick.touchingBall(circle_x, circle_y)) {
      // 如果確定有打到
      // 就改變x,y方向，並將brick從brickArray中移除
      count++;

      // 讓此brick的visible這個屬性 = false這樣下次forEach訪問到此元素的畫就不會觸發這個if判斷
      // 且下面也不會在畫出這個brick
      brick.visible = false;

      // 從下方撞擊
      if (circle_y >= brick.y + brick.height) {
        ySpeed *= -1;
      }
      // 從上方撞擊
      else if (circle_y <= brick.y) {
        ySpeed *= -1;
      }
      // 從左方撞擊
      else if (circle_x <= brick.x) {
        xSpeed *= -1;
      }
      // 從右方撞擊
      else if (circle_x >= brick.x + brick.width) {
        xSpeed *= -1;
      }

      // 把目前訪問的這個元素從陣列中刪除
      // array.splice(要開始刪除的index,要刪除幾個)
      //   brickArray.splice(index, 1);

      // 如果刪除後brickArray裡面沒東西了
      //   if (brickArray.length == 0) {
      //     // 彈出訊息:遊戲結束
      //     alert("遊戲結束");
      //     // 停止game這個無限執行的函式
      //     clearInterval(game);
      //   }

      // brick有10個
      if (count == 10) {
        // 彈出訊息:遊戲結束
        alert("遊戲結束");
        // 停止game這個無限執行的函式
        clearInterval(game);
      }
    }
  });

  // 畫出所有的Brick==============================================================

  // 對brickArray中的每個元素(物件)都做drawBrick這個method
  brickArray.forEach((brick) => {
    // 如果現在訪問的brick的visible屬性為true的畫再執行drawBrick函式畫出
    if (brick.visible) {
      brick.drawBrick();
    }
  });

  // 畫出ground==============================================================
  ctx.fillStyle = "orange";
  ctx.fillRect(ground_x, ground_y, groundWeith, groundHeight);

  // 每次畫球前確認是否碰到邊界==============================================================
  // 左右要交換方向就是 circle_x 加上 xSpeed * -1
  // 往右時xSpeed是正的，往左時xSpeed是負的
  // 左右邊界，circle_x大於等於canvas的寬減圓的半徑，代表碰到右邊界。circle_x小於等於圓的半徑，代表碰到左邊界
  if (circle_x >= canvasWidth - radius || circle_x <= radius) {
    xSpeed *= -1;
  }

  // 上下要交換方向就是 circle_y 加上 ySpeed * -1
  // 往下時ySpeed是正的，往上時ySpeed是負的
  // 上下邊界，circle_y大於等於canvas的長減圓的半徑，代表碰到下邊界。circle_y小於等於圓的半徑，代表碰到上邊界
  if (circle_y >= canvasHeight - radius || circle_y <= radius) {
    ySpeed *= -1;
  }

  // 確認是否有打到地板==============================================================
  if (
    // 如果球的y座標在地板的y座標上下圓的半徑內並且
    // 球的x座標在地板的x座標加上地板的寬(地板的整體)加上圓的半徑和地板x座標減掉圓(地板的左邊)的半徑之間
    // 如果這四個條件都滿足就代表會打到地板，所以改變上下方向
    circle_y >= ground_y - radius &&
    circle_y <= ground_y + radius &&
    circle_x <= ground_x + groundWeith + radius &&
    circle_x >= ground_x - radius
  ) {
    // 為了避免球會卡在地板的情況(在上面的if區間內一直改變上下方向)
    // 所以如果ySpeed>0(從上面打下來)，那就直接讓球的y座標減掉40，製造一個彈力的感覺
    // 如果從下打上來就加40
    if (ySpeed > 0) {
      circle_y -= 50;
    } else {
      circle_y += 50;
    }
    // 最後再改變上下移動方向
    ySpeed *= -1;
  }

  // 確認好方向後，就設定球這一幀的圓心的位置==============================================================
  circle_x += xSpeed;
  circle_y += ySpeed;

  // 畫出圓球(外框為黃色，用天空藍色填滿)
  // arc有五個參數:1.x 2.y 3.radius(半徑) 4.startAngle(初始角度) 5.endAngle(終止角度，2pi就等於360度
  // x,y會決定圓心的位置，startAngle=0,endAngle=2*pi就會畫出完整的圓
  ctx.beginPath();
  ctx.arc(circle_x, circle_y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "yellow";
  ctx.stroke();
  ctx.fillStyle = "skyblue";
  ctx.fill();
}

// setInterval讓我們可以每25毫秒(0.025秒)執行一次名為drawCircle的function
let game = setInterval(drawCircle, 25);
