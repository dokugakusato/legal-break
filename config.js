/* LEGAL BREAK の設定。
   メールでログインして記録をネットに保存する機能（Firebase）の設定。
   この値は公開してよいもので、記録の読み書きは Firestore のルールで本人だけに制限している。 */
window.LB_FIREBASE={
  apiKey:"AIzaSyBw1sYjfke9_F0HkhfnMNPoOfJ94IXaflY",
  authDomain:"legal-break.5ukaku.com",
  projectId:"legal-break-6882d",
  storageBucket:"legal-break-6882d.firebasestorage.app",
  messagingSenderId:"602255738798",
  appId:"1:602255738798:web:58dd53ed186b0cad646a3f",
  // ロボット確認（App Check）用の reCAPTCHA Enterprise（Fraud Defense）のサイトキー。空にすると止まる。
  // サイトキーは公開してよいもの（秘密キーのほうは絶対にここへ書かない）
  appCheckKey:"6Le0gQouAAAAAPO1iT7NjM71gnOptoOCXCwgv7gf"
};
