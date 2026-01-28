<?php

    require_once ("./config/Session.Config.php");
    require_once ("../conn/Conn.Class.php");
    $conn = new Conn("4ourjourney");

   /*  require_once ("./class/Login.Class.php");
    $login = new Login($conn->Connect()); */

    $v = rand(0, 9999);

    //Aqui preciso verificar se o usuário está logado !!

    echo 'Teste Feed Connected()';