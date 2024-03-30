const router = require("express").Router();
const User = require("../models/User");

// ルーティングでserver.jsへ繋ぐ

// router.get("/", (req, res) => {
//   res.send("user router");
// })

//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    // if (req.body.password) {
    //   try {
    //     req.body.password = req.body.password;
    //   } catch (err) {
    //     return res.status(500).json(err);
    //   }
    // }

    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        // Userモデルの中にあるパラメータを全て列挙している$set
        $set: req.body,
      });
      res.status(200).json("アカウント情報が更新されました");
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("あなたは自分のアカウントの時だけ情報を更新できます。");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("アカウント情報が削除されました");
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("あなたは自分のアカウントのみ削除可能です");
  }
});

//get a user
// router.get("/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     const { password, updateAt, ...other } = user._doc;
//     res.status(200).json(other);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

//クエリでuser情報を取得
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });

    // パスワードと更新時期以外の要素を取得して、表示する
    const { password, updatedAt, ...other } = user._doc;
    return res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      // userはDBより探しにいく、currentUserは自分自身を意味している
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      //フォロワーにいなかったらフォローできるをチェック
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("ユーザーはフォローされました");
      } else {
        return res.status(403).json("あなたはこのユーザーをすでにフォローしています");
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(500).json("自分自身をフォローすることはできません");
  }
});

//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      //フォロワーにいたらフォロー外せる
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("ユーザーはフォロを解除しました");
      } else {
        return res.status(403).json("あなたはこのユーザーをフォローしていません。");
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(500).json("自分自身をフォロー解除はできません");
  }
});


module.exports = router;