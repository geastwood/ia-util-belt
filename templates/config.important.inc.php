<?php
/*
    SETTING UP IMPORTANT VALUES NEEDED FOR ALL SCRIPTS
*/

// used in : mysql lib, global.tpl and global.inc.php maybe in config files
define('DEBUG_MODE', true);

// main directory and domain
if ($_SERVER["DOCUMENT_ROOT"])
{
     // for browser (standard)
    define('DIR_ROOT', realpath($_SERVER["DOCUMENT_ROOT"].'/..').'/');
}   
else
{
    // for shell scripts
    define('DIR_ROOT', $root_path);
}
if ($_SERVER["HTTP_HOST"])
{    // for browser (standard)
    define('DOMAIN_URL', $_SERVER["HTTP_HOST"]);
}
else
{   // for shell scripts
    define('DOMAIN_URL', 'www.intelliad.de');
}
define('URL_ROOT', 'http://' . DOMAIN_URL);
define('DOMAIN_NO_SUB', 'intelliad.de');
?>