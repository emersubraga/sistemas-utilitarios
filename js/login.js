const firebaseConfig = {
    apiKey: "AIzaSyCcPaWVNmwzEHVE-XdsDBJCWHbTmUwwjjs",
    authDomain: "controle-de-ordens-5c752.firebaseapp.com",
    databaseURL: "https://controle-de-ordens-5c752-default-rtdb.firebaseio.com",
    projectId: "controle-de-ordens-5c752",
    storageBucket: "controle-de-ordens-5c752.firebasestorage.app",
    messagingSenderId: "337470475095",
    appId: "1:337470475095:web:e746ae3f73f83b7bdc8c12",
    measurementId: "G-W0VK6EYRY2"
};

      firebase.initializeApp(firebaseConfig);
      const auth = firebase.auth();
      const db = firebase.database();
      let currentUser = null;

      // Verifica se estamos na página de login
      const isLogin = window.location.pathname.includes("login");

      if (isLogin) {
        window.login = function () {
          const email = document.getElementById("email").value;
          const password = document.getElementById("password").value;
          auth.signInWithEmailAndPassword(email, password)
            .then(() => window.location.href = "dashboard.html")
            .catch(e => alert("Erro: " + e.message));
        };
      } else {
        auth.onAuthStateChanged(user => {
          if (user) {
            currentUser = user;
            document.getElementById("user-info").innerText = `Logado como: ${user.email}`;
            carregarOrdens();
          } else {
            window.location.href = "login.html";
          }
        });

        window.logout = function () {
          auth.signOut().then(() => window.location.href = "login.html");
        };
      }