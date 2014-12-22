<?php

$activeDb = '10.104.16.13';

$config['user']['main'] = array(
    // cookies
    'LOGIN_COOKIE_NAME'             => 'intelliAdUser',
    'CHAP_COOKIE_TIMEOUT'           => '+1 day',

    // DB login
    'LOGIN_COOKIE_NAME'             => 'intelliAdUser',
    'CHAP_COOKIE_TIMEOUT'           => '+1 day',

    // DB login
    'SHARD_ID'                      =>  1,
    'DB_HOST_GLOBAL'                => $activeDb,
    'DB_HOST_LOCAL'                 => $activeDb,

    'DB_HOST'                       => $activeDb,
    'DB_SLAVE_HOST'                 => $activeDb,
    'DB_USE_SLAVE'                  => 'false',
    'DB_DATABASE'                   => 'intellibo_login',
    'DB_USER'                       => 'intelli_dev',
    'DB_PASSWORD'                   => 'IDev_4711',


    'DEFAULTEMAIL'                  => 'xxxx@intelliad.com',

    // The Google Invite Agency ID (intelliad)
    'INTELLIAD_BOCLIENT_ID'         => '121',

    // Receives: New regs, Api errors, Import notices
    'INTELLIAD_ADMIN_EMAILADDR'     => 'xxxx@intelliad.com',


	//RemoteProcess Settings
    'REMOTEPROCESS_KEYFILE'         => '/data/login.intelliad.de/mykeyfile',
	'REMOTEPROCESS_HOST'            => '192.168.10.1',
    'REMOTEPROCESS_HOSTS_COMBINED_STR' => 'localhost,127.0.0.1',
	'REMOTEPROCESS_USER'            => 'myuser',
	'REMOTEPROCESS_SCRIPTPATH'      => '/data/IntelliAd/IntelliAd/shell/',

    // Receives: New regs
    'INTELLIAD_SMS_USERNAME'        => '',
    'INTELLIAD_SMS_PASSWORD'        => '',
    'INTELLIAD_SMS_RECEIVER'        => ''
);
?>
