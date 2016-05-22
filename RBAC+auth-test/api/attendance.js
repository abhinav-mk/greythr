var express = require('express'),
    mongoose = require('mongoose'),
    q = require('q'),
    User = mongoose.models.User,
    Session = mongoose.models.Session,
    School = mongoose.models.School,
    Attendance = mongoose.models.Attendance;
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var app = express();
var apiRoutes = express.Router(); 
var base = require('../lib/base.js');
var apiRoutes = require('./auth.js');


apiRoutes.post('/attendance/section/list', classSectionList);
apiRoutes.post('/attendance/getstudentlist', getStudentList);
apiRoutes.post('/attendance/create', createAttendance);
apiRoutes.post('/attendance/subject/list', getSubjectList);
apiRoutes.post('/attendance/retrieve/bydate', getAttendanceByDate);
apiRoutes.post('/attendance/class/totalnumberofclassestaken', totalNumberOfClassesTaken);
// apiRoutes.post('/attendance/retrieve/recent', getRecentAttendance);
apiRoutes.post('/attendance/save', saveAttendance);  // here content-type is application/json

function saveAttendance(req, res){
	var token = req.body.token;
	var user_class = req.body.class;
	var date = req.body.date;
	date = new Date(date);
	date.setDate(date.getDate() + 1);
	date = date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
	date = date.split(" ")[0];
	date = date.split("-");
	date[1] = date[1]-1;
	date = new Date(date[0], date[1], date[2]);
	console.log("date");
	console.log(date);
	
	var user_section = req.body.section;
	var data = req.body.data;
	var val = [];
	for(var i=0;i<data.length;i++)
	{
		var temp = {};
		temp.user = data[i].id;
		temp.period = Object.keys(data[i].details);
		var temp1 = [];
		for(var j=0;j<temp.period.length;j++)
		{
			var t = temp.period[j];
			temp1[j] = data[i].details[t];
		}
		temp.value = temp1;
		val[i] = temp;
	}

	base.rbac.can(token, 'create_attendance').then(function(bool){
		if(bool)
		{
			base.util.getSchoolIdFromToken(token).then(function(id){
				attendance = new Attendance({date:date,class:user_class,section:user_section,values:val,school:id});
				/*attendance.save(function(err){
				if(err)
				{
					res.send({message: err, success: false});
				}
				else{
					res.send({message:"successfully updated attendance", success: true});
				}
				});*/
				Attendance.update({date:date,class:user_class,section:user_section,school:id}, {values:val},{upsert:true} , function (err) {
					if(err){
						res.send({message: err, success: false});		
					}
					else{
						res.send({message:"successfully updated attendance", success: true});
					}
				});
			});
		}
		else
		{
			res.send({message: "not enough privilege", success: false});
		}
	});
	// console.log(test)
	// res.send(test);
};

function classSectionList(req, res){
	var token = req.body.token;
	Session.findOne({token:token}, function(err, session){
		if(err)
		{
			res.send({message:err,success:false});
		}
		User.findOne({_id:session.userid}, function(err, user){
			if(err)
			{
				res.send({message:err,success:false});
			}
			var response = [];
			var count=0;
			for(var i=0;i<user.scope.length;i++)
			{
				var list = {};
				var user_class = user.scope[i].class;
				var user_section = user.scope[i].section;
				list["name"] = user_class+"-"+user_section;
				list["filter"] = user_class+"-"+user_section;
				list["class"] = user_class;
				list["section"] = user_section;
				response.push(list);
			}
			res.send({data: response, message:"successfully sent the list", success: true});
		});
	});
}

function createAttendance(req, res){
	var token = req.body.token;
	var user_class = req.body.class;
	var user_section = req.body.section;
	var date = req.body.date;
	date = new Date(date);
	date.setDate(date.getDate() + 1);
	date = date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
	date = date.split(" ")[0];
	date = date.split("-");
	date[1] = date[1]-1;
	date = new Date(date[0], date[1], date[2]);
	console.log(date);
	console.log("In createAttendance");


	base.rbac.can(token, 'create_attendance').then(function(bool){
		if(bool)
		{
			console.log("Permitted");
			base.util.getSchoolIdFromToken(token).then(function(id){
				// var data = {
				// 	school: id,
				// 	class: user_class,
				// 	section: user_section,
				// 	count: 6,
				// 	date: date
				// }
				// attendance = new Attendance(data);
				// attendance.save(function(err){
				// 	if(err)
			 //        {
			 //        	res.send({message:err,success: false});
			 //        }
			 //        else
			 //        {
			 	console.log("School detected");
			        	base.util.getUsersOfRoleClassSection('Student',user_class,user_section,token).then(function(data){
			        		console.log("Students Detected");
			        		console.log("create new attendance:"+data)
			        		var val = [];
			        		val[0] = {type: "header", data:[{type:"String", name:"Name", attribute:"name"},{type:"String", name:"Roll Number", attribute:"rollno"}]};
			        		for(var i=0;i</*6*/1;i++) // update here
			        		{
			        			// val[0].data[val[0].data.length] = {type:"checkbox", name:"Period "+(i+1), attribute:"period"+(i+1)}; Update here
			        			val[0].data[val[0].data.length] = {type:"checkbox", name:"Attendance ", attribute:"Attendance"};
			        		}
			        		val[1] = {type:"value"};
			        		val[1].data = []
			        		for(var i=0;i<data.length;i++)
			        		{
			        			// update here
			        			val[1].data[i] ={uid:data[i]._id, name:data[i].name, rollno:data[i].rollno, Attendance:null/*, period2:null, period3:null,period4: null,period5:null,period6:null*/};
			        		}

			        		res.send(val);
			        	});
			 //        }
				// });
			});
		}
		else
		{
			res.send({message: "not enough privilege", success: false});
		}
	});
}

function getSubjectList(req, res){
	var token = req.body.token;
	var user_class = req.body.class;
	var user_section = req.body.section;
	var subjects = [];
	base.util.getSchoolIdFromToken(token).then(function(id){
		School.findOne({_id:id}, function(err, school){
			if(err)
			{
				res.send({message:err, success:false});
			}
			for(var i=0;i<school.scope.length;i++)
			{
				if(school.scope[i].class == user_class && school.scope[i].section == user_section)
				{
					subjects = school.scope[i].subjects;
					break;
				}
			}
			res.send({data:subjects, message:"successfully sent subject list", success:true});
		});
	});
}

// function getAttendanceByDate(req, res){
// 	var token = req.body.token;
// 	var user_class = req.body.class;
// 	var user_section = req.body.section;
// 	var date = req.body.date;
	// Attendance.find({class: user_class,section: user_section, date: date}, function(err, attendance){
	// 	if(err)
	// 	{
	// 		res.send({message: err, success: false});
	// 	}
	// 	var  count = attendance.length;
	// 	var data = [];
	// 	data[0] = {type: "header", data:[{type:"String", name:"Name", attribute:"name"},{type:"String", name:"Roll Number", attribute:"rollno"}]};
	// 	for(var i=0;i<count;i++)
	// 	{
	// 		data[0].data[data[0].data.length] = {type:"checkbox", name:"Period "+attendance[i].count, attribute:"value"};
	// 	}
	// 	data[1] = {type:"value"};
	// 	data[1].data = [];

	// 	for(var i=0;i<attendance[0].values.length;i++)
	// 	{
	// 		User.findOne({_id:attendance[0].values[i].user}, function(err, user){
	// 			if(err)
	// 			{
	// 				res.send({message:err, success: false});
	// 			}
	// 			data[1].data[data[1].data.length] = {id:user._id,name:user.name,rollno:user.rollno};
	// 			console.log(data)
	// 		});
	// 	}
		
	// });
// 	base.rbac.can(token, 'create_user').then(function(bool){
// 		if(bool)
// 		{

// 		}
// 		else
// 		{
// 			base.rbac.can(token, 'create_user').then(function(bool1){
// 				if(bool1)
// 				{
// 					Attendance.find({class: user_class,section: user_section, date: date}, function(err, attendance){
// 						if(err)
// 						{
// 							res.send({message: err, success: false});
// 						}
// 						var  count = attendance.length;
// 						var data = [];
// 						data[0] = {type: "header", data:[{type:"String", name:"Name", attribute:"name"},{type:"String", name:"Roll Number", attribute:"rollno"}]};
// 						for(var i=0;i<count;i++)
// 						{
// 							data[0].data[data[0].data.length] = {type:"checkbox", name:"Period "+attendance[i].count, attribute:"period"+attendance[i].count};
// 						}
// 						data[1] = {type:"value"};
// 						data[1].data = [];
// 						Session.findOne({token:token}, function(err, session){
// 							User.findOne({_id:session.userid}, function(err, user){
// 								data[1].data[0] = {id:user._id,name:user.name,rollno:user.rollno};
// 								for(var i=0;i<attendance.length;i++)
// 								{
// 									for(var j=0;j<attendance[i].values.length;j++)
// 									{
// 										if(user._id==attendance[i].values[j].user)
// 										{
// 											data[1].data[0]["period"+attendance[i].count] = attendance[i].values[j].value;
// 											break;
// 										}
// 									}
// 								}
// 								res.send({data:data, message:"successfully sent data", success: true});
// 							});
// 						});
						
// 					});
// 				}
// 				else
// 				{
// 					 res.send({message:"Not enough privileges",success: false});
// 				}
// 			})
// 		}
// 	});
// }

function getAttendanceByDate(req, res)
{
	var token = req.body.token;
	var user_class = req.body.class;
	var user_section = req.body.section;
	var userid = req.body.userid;
	var date = req.body.date;
	date = new Date(date);
	console.log("bofore setDate");
	console.log(date);
	date.setDate(date.getDate() + 1);
	console.log("before toISOString");
	console.log(date);
	date = date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
	date = date.split(" ")[0];
	date = date.split("-");
	date[1] = date[1]-1;
	// date = new Date(date[0], date[1], date[2]);
	// date.setDate(date.getDate() - 1);
	console.log(date[0]);
	console.log(date[1]);
	console.log(date[2]);
	// console.log(date);
	// date = date.toISOString();
	// console.log("date.toISOString");
	date = new Date(date[0], date[1], date[2]);
	console.log(date);
	console.log("In getAttendanceByDate");
	var val = [];
	base.rbac.can(token, 'view_any_attendance').then(function(bool){
		if(bool)
		{
			console.log("bool view attendance:"+bool);
			Attendance.find({date:date}, function(err, attendance){
			console.log(date);
			console.log(user_class);
			console.log(user_section);
			console.log(token);
			base.util.getUsersOfRoleClassSection('Student',user_class,user_section,token).then(function(data){
			console.log("student data"+data)
			var attendance1 = attendance[0];
			// console.log(attendance1);
			var val = [];
			   val[0] = {type: "header", data:[{type:"String", name:"Name", attribute:"name"},{type:"String", name:"Roll Number", attribute:"rollno"}]};
			   // console.log("here1");
			   if(attendance1 == undefined)
			   	res.send("");
			   else
			   {
			   	// console.log("here2");
			   	var periods = attendance1.values[0].period;
			   	// update here
			   	for(var i=0;i</*periods.length*/1;i++) // Attendance is only displayed. Uncomment this to show others
			   	{
			   		// console.log("here3");
			   	val[0].data[val[0].data.length] = {type:"checkbox", name:periods[i], attribute:periods[i]};
			   	}
			   	val[1] = {type:"value"};
			       val[1].data = [];
			       console.log(attendance1.values[0].value[2])
			       for(var i=0;i<data.length;i++)
			       	{	
			       		// console.log("here4");
			       		console.log('userid');
			       		console.log(userid);
			       		if(userid){
			       			// console.log("here5");
			       			if(userid == data[i]._id){
			       				val[1].data[i] = {date: date, uid:data[i]._id, name:data[i].name, rollno:data[i].rollno, Attendance:attendance1.values[i].value[0]/*, period2:attendance1.values[i].value[1], period3:attendance1.values[i].value[2],period4: attendance1.values[i].value[3],period5:attendance1.values[i].value[4],period6:attendance1.values[i].value[5]*/};
			       			}
			       		}
			       		else{
			       			// console.log("here6");
			       			val[1].data[i] = {date: date, uid:data[i]._id, name:data[i].name, rollno:data[i].rollno, Attendance:attendance1.values[i].value[0]/*, period2:attendance1.values[i].value[1], period3:attendance1.values[i].value[2],period4: attendance1.values[i].value[3],period5:attendance1.values[i].value[4],period6:attendance1.values[i].value[5]*/};
			       		}
			       	}
			       	console.log(val)
			       	res.send(val);
			   }  
			   });
			});
		}
		else
		{
			base.rbac.can(token, 'view_self_attendance').then(function(bool1){
				if(bool1)
				{
					Attendance.find({date:date}, function(err, attendance){
							//base.util.getUsersOfRoleClassSection('Admin',user_class,user_section,token).then(function(data){
							var attendance1 = attendance[0];
							// console.log(attendance1.length);
							var val = [];
						    val[0] = {type: "header", data:[{type:"String", name:"Name", attribute:"name"},{type:"String", name:"Roll Number", attribute:"rollno"}]};
						    if(attendance1 == undefined){
						    	console.log("coming here2");
						    	res.send("");
						    }
						    else
						    {
						    	var periods = attendance1.values[0].period;
						    	for(var i=0;i<periods.length;i++)
						    	{
						    		val[0].data[val[0].data.length] = {type:"checkbox", name:periods[i], attribute:periods[i]};
						    	}
						    	val[1] = {type:"value"};
						        val[1].data = [];
						        var count1=0
						        Session.findOne({token:token}, function(err, session){
						        	if (err){
						        		console.log("coming here1");
						        		res.send("");
						        	}
						        	else{
						        		for(var k=0;k<attendance1.values.length;k++)
							        	{
							        		if(attendance1.values[k].user==session.userid)
							        		{
							        			count1 = k;
							        			break;
							        		}
							        	}
							        	User.findOne({_id:session.userid}, function(err, user){
							        		if(err) {
							        			console.log("coming here 3");
							        			res.send("");
							        		}
							        		else{
							        			var i=0;
								        		val[1].data[i] = {date:date, uid:user._id, name:user.name, rollno:user.rollno, Attendance:attendance1.values[count1].value[0]/*, period2:attendance1.values[count1].value[1], period3:attendance1.values[count1].value[2],period4: attendance1.values[count1].value[3],period5:attendance1.values[count1].value[4],period6:attendance1.values[count1].value[5]*/};
								        		console.log("val hereeee")
								        		console.log(val)
								        		res.send(val);
							        		}
							        	});
						        	}
						        });
						    }  
					    });
				}
				else
				{
					console.log("coming here1");
					res.send({message:"Not enough privileges",success: false});
				}
			});
		}
	});
}

function getStudentList(req, res){
	var token = req.body.token;
	var user_class = req.body.class;
	var user_section = req.body.section;
	base.rbac.can(token, 'create_attendance').then(function(bool){
		if(bool)
		{

			base.util.getSchoolIdFromToken(token).then(function(id){
	        	base.util.getUsersOfRoleClassSection('Student',user_class,user_section,token).then(function(data){
	        		var val = [];
	        		for(var i=0;i<data.length;i++)
	        		{
	        			val.push({uid:data[i]._id, name:data[i].name, rollno:data[i].rollno});
	        		}

	        		res.send({success: true, data: val});
	        	});
			});
		}
		else
		{
			res.send({message: "not enough privilege", success: false});
		}
	});
}

function totalNumberOfClassesTaken(req, res) {
	var token = req.body.token;
	var user_class = req.body.class;
	var user_section = req.body.section;
	var val = [];
	base.rbac.can(token, 'view_any_attendance').then(function(bool){
		if(bool)
		{
			console.log("bool view attendance:"+bool)
					base.util.getSchoolIdFromToken(token).then(function(id){
						if(id){
							Attendance.find({class: user_class, section: user_section, school: id}, function(err, attendance){

							var data = null;
							attendance.forEach(function (day) {// a particular day's attendance
								var thatDay = {};
								console.log("day");
								console.log(JSON.stringify(day));
								day.values.forEach(function (value) { // a persons attendance for that day
									for(var i =0; i<value.period.length; i++){
										thatDay[value.period[i]] = thatDay[value.period[i]] || false;
									}
									for(var i =0; i<value.period.length; i++){
										if(value.value[i] != "null"){
											console.log("value.value[i]");
											console.log(value);
											thatDay[value.period[i]] = thatDay[value.period[i]] || true;
										}
									}
									console.log("JSON.stringify(thatDay)");
									console.log(JSON.stringify(thatDay));
									console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
								});
								console.log("####################3");
								if(data == null){
									data = {};
									for (var key in thatDay) {
										    data[key] = 0;
									}
								}
								for (var key in thatDay) {
									if (data.hasOwnProperty(key)) {
										if (thatDay[key]){
									    	data[key] ++;
										}
									}
								}
							});
							var responseData = [];
							for (var key in data) {
								    responseData.push({id: key, value: data[key]});
							}
							res.send({success: true, data: responseData});
						});
						}
						else{
							res.send({message:"retrieve failed",success: false});
						}
					});

			
		}
		else
		{
			base.rbac.can(token, 'view_self_attendance').then(function(bool1){
				if(bool1)
				{	console.log("bool view attendance:"+bool)
					base.util.getSchoolIdFromToken(token).then(function(id){
						if(id){
							Attendance.find({class: user_class, section: user_section, school: id}, function(err, attendance){

							var data = null;
							attendance.forEach(function (day) { // a particular day's attendance
								var thatDay = {};
								day.values.forEach(function (value) {
									for(var i =0; i<value.period.length; i++){
										thatDay[value.period[i]] = false;
									}
									for(var i =0; i<value.period.length; i++){
										if(value.value[i] != "null"){
											thatDay[value.period[i]] = true;
										}
									}
								});
								if(data == null){
									data = {};
									for (var key in thatDay) {
										    data[key] = 0;
									}
								}
								for (var key in thatDay) {
									if (data.hasOwnProperty(key)) {
										if (thatDay[key]){
									    	data[key] ++;
										}
									}
								}
							});
							var responseData = [];
							console.log("responseData");
							console.log(JSON.stringify(responseData));
							for (var key in data) {
								    responseData.push({id: key, value: data[key]});
							}
							// console.log("JSON.stringify(data)");
							console.log(JSON.stringify(responseData));
							res.send({success: true, data: responseData});
						});
						}
						else{
							res.send({message:"retrieve failed",success: false});
						}
					});
				}
				else
				{
					res.send({message:"Not enough privileges",success: false});
				}
			});
		}
	});
}

module.exports = apiRoutes;