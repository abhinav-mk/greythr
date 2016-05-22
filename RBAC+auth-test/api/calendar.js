var express = require('express'),
    mongoose = require('mongoose'),
    underscore = require('underscore'),
    q = require('q'),
    User = mongoose.models.User,
    Session = mongoose.models.Session,
    School = mongoose.models.School,
    SelfCalendar = mongoose.models.SelfCalendar,
    GlobalCalendar = mongoose.models.GlobalCalendar;
var jwt    = require('jsonwebtoken');
var app = express();
var apiRoutes = express.Router(); 
var base = require('../lib/base.js');
var apiRoutes = require('./auth.js');

// API to get exams list and respective IDs by class and section
apiRoutes.post('/calendar/createSelfEvent', createSelfCalendarEvent);
apiRoutes.post('/calendar/createGlobalEvent', createGlobalCalendarEvent);
apiRoutes.post('/calendar/editSelfEvent', editSelfCalendarEvent);
apiRoutes.post('/calendar/editGlobalEvent', editGlobalCalendarEvent);
apiRoutes.post('/calendar/getSelfEvent', getSelfCalendarEvent);
apiRoutes.post('/calendar/getGlobalEvent', getGlobalCalendarEvent);
apiRoutes.post('/calendar/deleteSelfEvent', deleteSelfCalendarEvent);
apiRoutes.post('/calendar/deleteGlobalEvent', deleteGlobalCalendarEvent);


function createSelfCalendarEvent (req, res) {
	var token = req.body.token;
	var data = req.body.data;
	var schoolid = null;
	base.rbac.can(token, 'view_self_attendance').then(function(bool){ // change permission to create_self_calendar_event
		if(bool)
		{
			Session.findOne({token: token}, function (err, session) {
				if (err){
					res.send({success: false, message: err});
				}
				else{
					base.util.getSchoolIdFromToken(token).then(function(id){
						schoolid = id;
						console.log("schoolid: "+schoolid);
						console.log("userid: "+session.userid);
						SelfCalendar.findOne({userid: session.userid, school: schoolid}, function (err, result) {
							if (err){
								console.log("error: "+err);
								res.send(err);
							}
							else{
								console.log("result");
								console.log(result);
								if (result){
									// found one
									data['createdOn'] = new Date();
									var eventList = result.eventList;
									eventList.push(data);
									SelfCalendar.update({_id: result._id}, {userid: session.userid, school: schoolid, eventList: eventList},{upsert: true}, function (err) {
										if (err){
											console.log(err);
											res.send({message:err,success: false});
										}
										else{
											res.send({success: true, message: "Event Added", createdOn: data['createdOn']});
										}
									});
								}
								else{
									// no such data field
									data['createdOn'] = new Date();
									var list = [];
									list.push(data);
									var data1 = {
										school: schoolid,
										userid: session.userid,
										eventList: list
									}
									var sc = new SelfCalendar(data1);
									sc.save(function(err){
										if(err)
								        {
								        	console.log(err);
								          	res.send({message:err,success: false});
								        }
								        else
								        {
								          res.send({message:"Event Added", success: true, createdOn: data['createdOn']});
								        }
						    		});
								}
							}
						});
					});
				}
			}); 
			
			// res.send(data);
		}
		else
		{
			console.log("no access");
			res.send({message: "Permission denied", success: false});
		}
	});
}
function createGlobalCalendarEvent (req, res) {
	var token = req.body.token;
	var data = req.body.data;
	var schoolid = null;
	base.rbac.can(token, 'create_attendance').then(function(bool){ // change permission to create_self_calendar_event
		if(bool)
		{
			Session.findOne({token: token}, function (err, session) {
				if (err){
					res.send({success: false, message: err});
				}
				else{
					base.util.getSchoolIdFromToken(token).then(function(id){
						schoolid = id;
						GlobalCalendar.findOne({school: schoolid}, function (err, result) {
							if (err){
								console.log("error: "+err);
								res.send(err);
							}
							else{
								console.log("result");
								console.log(result);
								data['createdOn'] = new Date();
								data['owner'] = session.userid;
								if (result){
									// found one
									var eventList = result.eventList;
									eventList.push(data);
									GlobalCalendar.update({_id: result._id}, {school: schoolid, eventList: eventList}, function (err) {
										if (err){
											console.log(err);
											res.send({message:err,success: false});
										}
										else{
											console.log("here1: "+data['createdOn']);
											res.send({success: true, message: "Event Added", createdOn: data['createdOn'], owner: session.userid, sharedEvent: true});
										}
									});
								}
								else{
									// no such data field
									data['createdOn'] = new Date();
									data['owner'] = session.userid;
									var list = [];
									list.push(data);
									var data1 = {
										school: schoolid,
										eventList: list
									}
									var sc = new GlobalCalendar(data1);
									sc.save(function(err){
										if(err)
								        {
								        	console.log(err);
								          	res.send({message:err,success: false});
								        }
								        else
								        {
								        	console.log("here2: "+data['createdOn']);
								          	res.send({message:"Event Added", success: true, createdOn: data['createdOn'], owner: session.userid, sharedEvent: true});
								        }
						    		});
								}
							}
						});
					});
				}
			}); 
			
			// res.send(data);
		}
		else
		{
			console.log("no access");
			res.send({message: "Permission denied", success: false});
		}
	});
}
function editSelfCalendarEvent (req, res) {
	// console.log("@ editSelfCalendarEvent");
	// res.send("");
	var token = req.body.token;
	var event = req.body.data;
	var createdOn = event.createdOn;
	console.log("id:" +createdOn);
	var schoolid = null;
	base.rbac.can(token, 'create_attendance').then(function(bool){ // change permission to create_self_calendar_event
		if(bool)
		{
			Session.findOne({token: token}, function (err, session) {
				if (err){
					res.send({success: false, message: err});
				}
				else{
					base.util.getSchoolIdFromToken(token).then(function(id){
						schoolid = id;
						console.log("schoolid: "+schoolid);
						console.log("userid: "+session.userid);
						SelfCalendar.update({userid: session.userid, school: schoolid}, { $pull: {eventList: {createdOn: createdOn}}}, function (err, data) {
							if (err){
								console.log("error: "+err);
								res.send(err);
							}
							else{
								SelfCalendar.findOne({userid: session.userid, school: schoolid}, function (err, result) {
									if (err){
										console.log("error: "+err);
										res.send(err);
									}
									else{
										if (result){
											console.log(result);
											var eventList = result.eventList;
											eventList.push(event);
											SelfCalendar.update({userid: session.userid, school: schoolid}, { eventList: eventList}, {safe: true, upsert: true}, function (err, data) {
												if (err){
													console.log("errorheresdaefs: "+err);
													res.send(err);
												}
												else{
													
													res.send({success: true, message: "event edited"});
												}
											});
										}
										else{
											// no such data field
											res.send({success: false, message: "no document found"});
										}
									}
								});
							}
						});
					});
				}
			}); 
			
			// res.send(data);
		}
		else
		{
			console.log("no access");
			res.send({message: "Permission denied", success: false});
		}
	});
}

function editGlobalCalendarEvent (req, res) {
	// console.log("@ editSelfCalendarEvent");
	// res.send("");
	var token = req.body.token;
	var event = req.body.data;
	var createdOn = event.createdOn;
	console.log("id:" +createdOn);
	var schoolid = null;
	base.rbac.can(token, 'create_attendance').then(function(bool){ // change permission to create_self_calendar_event
		if(bool)
		{
			Session.findOne({token: token}, function (err, session) {
				if (err){
					res.send({success: false, message: err});
				}
				else{
					base.util.getSchoolIdFromToken(token).then(function(id){
						schoolid = id;
						GlobalCalendar.update({school: schoolid}, { $pull: {eventList: {createdOn: createdOn, owner: session.userid}}}, function (err, data) {
							if (err){
								console.log("error: "+err);
								res.send(err);
							}
							else{
								GlobalCalendar.findOne({school: schoolid}, function (err, result) {
									if (err){
										console.log("error: "+err);
										res.send(err);
									}
									else{
										if (result){
											console.log(result);
											var eventList = result.eventList;
											eventList.push(event);
											GlobalCalendar.update({school: schoolid}, { eventList: eventList}, {safe: true, upsert: true}, function (err, data) {
												if (err){
													console.log("errorheresdaefs: "+err);
													res.send(err);
												}
												else{
													
													res.send({success: true, message: "event edited"});
												}
											});
										}
										else{
											// no such data field
											res.send({success: false, message: "no document found"});
										}
									}
								});
							}
						});
					});
				}
			}); 
			
			// res.send(data);
		}
		else
		{
			console.log("no access");
			res.send({message: "Permission denied", success: false});
		}
	});
}
function getSelfCalendarEvent (req, res) {
	var token = req.body.token;
	var data = req.body.data;
	var schoolid = null;
	base.rbac.can(token, 'view_self_attendance').then(function(bool){ // change permission to create_self_calendar_event
		if(bool)
		{
			Session.findOne({token: token}, function (err, session) {
				if (err){
					res.send({success: false, message: err});
				}
				else{
					base.util.getSchoolIdFromToken(token).then(function(id){
						schoolid = id;
						console.log("schoolid: "+schoolid);
						console.log("userid: "+session.userid);
						SelfCalendar.findOne({userid: session.userid, school: schoolid}, function (err, result) {
							if (err){
								console.log("error: "+err);
								res.send(err);
							}
							else{
								if(result)
								{
									console.log("result");
									console.log(result);
									if (result){
										console.log(result);
										res.send({success: true, result: result});
									}
									else{
										// no such data field
										res.send({success: true, result: result});
									}
								}else res.send({success: true, result: null});
							}
						});
					});
				}
			}); 
			
			// res.send(data);
		}
		else
		{
			console.log("no access");
			res.send({message: "Permission denied", success: false});
		}
	});
}
function deleteSelfCalendarEvent (req, res) {
	var token = req.body.token;
	var createdOn = req.body.id;
	console.log("id:" +createdOn);
	var schoolid = null;
	base.rbac.can(token, 'create_attendance').then(function(bool){ // change permission to create_self_calendar_event
		if(bool)
		{
			Session.findOne({token: token}, function (err, session) {
				if (err){
					res.send({success: false, message: err});
				}
				else{
					base.util.getSchoolIdFromToken(token).then(function(id){
						schoolid = id;
						console.log("schoolid: "+schoolid);
						console.log("userid: "+session.userid);
						SelfCalendar.update({userid: session.userid, school: schoolid}, { $pull: {eventList: {createdOn: createdOn}}}, function (err, data) {
							if (err){
								console.log("error: "+err);
								res.send(err);
							}
							else{
								console.log("here: ");
								console.log(data);
								res.send({success: true, message: "event Deleted"});
							}
						});
					});
				}
			}); 
			
			// res.send(data);
		}
		else
		{
			console.log("no access");
			res.send({message: "Permission denied", success: false});
		}
	});
}
function deleteGlobalCalendarEvent (req, res) {
	var token = req.body.token;
	var createdOn = req.body.id;
	console.log("id:" +createdOn);
	var schoolid = null;
	base.rbac.can(token, 'create_attendance').then(function(bool){ // change permission to create_self_calendar_event
		if(bool)
		{
			Session.findOne({token: token}, function (err, session) {
				if (err){
					res.send({success: false, message: err});
				}
				else{
					base.util.getSchoolIdFromToken(token).then(function(id){
						schoolid = id;
						GlobalCalendar.update({school: schoolid}, { $pull: {eventList: {createdOn: createdOn, owner: session.userid}}}, function (err, data) {
							if (err){
								console.log("error: "+err);
								res.send(err);
							}
							else{
								console.log("here: ");
								console.log(data);
								res.send({success: true, message: "event Deleted"});
							}
						});
					});
				}
			}); 
			
			// res.send(data);
		}
		else
		{
			console.log("no access");
			res.send({message: "Permission denied", success: false});
		}
	});
}
function getGlobalCalendarEvent (req, res) {
	var token = req.body.token;
	var data = req.body.data;
	var schoolid = null;
	base.rbac.can(token, 'view_self_attendance').then(function(bool){ // change permission to create_self_calendar_event
		if(bool)
		{
			Session.findOne({token: token}, function (err, session) {
				if (err){
					res.send({success: false, message: err});
				}
				else{
					base.util.getSchoolIdFromToken(token).then(function(id){
						schoolid = id;
						GlobalCalendar.findOne({school: schoolid}, function (err, result) {
							if (err){
								console.log("error: "+err);
								res.send(err);
							}
							else{
								if(result)
								{
									User.findOne({_id:session.userid}, function(err, user){
							        if(err)
							          res.send({message: err, success:false});
							        else
							        {
							        	var returnData = [];
							          	// got the users scope
							          	// console.log("user");
							          	// console.log(user);
							          	// console.log("result");
							          	// console.log(JSON.stringify(result));
							          	result.eventList.forEach(function (event) {
							          		for(var i=0; i<event.roles.length; i++) {
							          			var role = event.roles[i];
							          			if(role == user.role){
								          			var allowed = checkUserScopeAccessForGlobalEvent(user, event);
								          			if (allowed){
								          				returnData.push(event);
								          			}
								          			break;
								          		}
							          		}
							          	});
							          	result.eventList = returnData;
							          	res.send({success: true, result: result});
							          	// res.send({scope:user.scope, message: "successfully sent user info", success: true});
							        }
							    });
								}
								else res.send({success: true, result: null});
								// add conditions that ensure scope security
								
								// if (result){
								// 	console.log(result);
								// 	res.send({success: true, result: result});
								// }
								// else{
								// 	// no such data field
								// 	res.send({success: true, result: result});
								// }
							}
						});
					});
				}
			}); 
			
			// res.send(data);
		}
		else
		{
			console.log("no access");
			res.send({message: "Permission denied", success: false});
		}
	});
}

function checkUserScopeAccessForGlobalEvent(user, event) {
	var eventClassList = [];
	var userClassList = [];

	event.classAndSubject.forEach(function (data) {
		eventClassList.push(data.class+"-"+data.section);
	});
	user.scope.forEach(function (data) {
		userClassList.push(data.class+"-"+data.section);
	});

	var commonClassList = underscore.intersection(userClassList, eventClassList);
	if (commonClassList.length > 0){
		return true;
	}
	else{
		return false;
	}

}


module.exports = apiRoutes;