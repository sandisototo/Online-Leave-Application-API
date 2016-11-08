// Include all required libraries
var express 	= require("express");
var mysql   	= require("mysql");
var bodyParser  = require("body-parser");
var md5 		= require('MD5');
var moment = require('moment');
var request = require('request');
var app 		= express();

var enviroment = require('./../enviroment');

// declaring global variables
exports.express 	= express;
exports.mysql 		= mysql;
exports.bodyParser 	= bodyParser;
exports.md5 		= md5;
exports.moment 		= moment;
exports.request = request;
exports.app 		= app;

exports.enviroment 		= enviroment;
