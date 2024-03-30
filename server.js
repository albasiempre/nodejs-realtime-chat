// console.log("nodejs")
const express = require("express");
const app = express();
const cors = require('cors');
const path = require('path');
const useRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const projectRoute = require("./routes/project");
const uploadRoute = require("./routes/upload");
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
// const MyPageRoute = require("./routes/mypage");


const mongoose = require("mongoose");
// require("dotenv").config();

// reactのルーティングとの調整
const PORT = process.env.PORT || 8000;


// NodeとDBの接続作業

mongoose
.connect("mongodb+srv://albasiempre:Akihisa5931@social-media-mock.7d00tfp.mongodb.net/social-media-mock?retryWrites=true&w=majority")
.then( () => {
  console.log("DBと接続しました");
})
  .catch( (err) => {
    console.log("DBと接続していません");

});


// ミドルウェア
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(express.json());
app.use("/api/users",useRoute)
app.use("/api/auth",authRoute)
app.use("/api/posts",postRoute)
app.use("/api/projects",projectRoute)
app.use("/api/upload",uploadRoute)
app.use("/api/conversations/",conversationRoute)
app.use("/api/messages",messageRoute)
// app.use("/api/mypage",MyPageRoute)


app.get("/", (req, res) => {
  res.send("hello postman");

})



// })


app.listen(PORT, () => console.log("サーバーが起動しました"));

// Corsの設定

app.use(cors({
  origin: 'https://reactjs-realtime-chat.vercel.app/', //アクセス許可するオリジン
  credentials: true, //レスポンスヘッダーにAccess-Control-Allow-Credentials追加
  optionsSuccessStatus: 200 //レスポンスstatusを200に設定
}))

// ドメイン名が違うと設定した方がいい
