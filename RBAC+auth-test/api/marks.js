var express = require('express'),
    mongoose = require('mongoose'),
    q = require('q'),
    User = mongoose.models.User,
    Session = mongoose.models.Session,
    School = mongoose.models.School,
    Attendance = mongoose.models.Attendance,
    Marks = mongoose.models.Marks;
var jwt    = require('jsonwebtoken');
var app = express();
var apiRoutes = express.Router(); 
var base = require('../lib/base.js');
var apiRoutes = require('./auth.js');

// API to get exams list and respective IDs by class and section
apiRoutes.post('/marks/examlist', getExamListByClassSection);
apiRoutes.post('/marks/view', getMarksById);
apiRoutes.post('/marks/create', createMarks);
apiRoutes.post('/marks/edit', editMarks);
apiRoutes.post('/marks/analytics', analytics);

function getExamListByClassSection(req, res){
	var token = req.body.token;
	var user_class = req.body.class;
	var user_section = req.body.section;
	base.util.getSchoolIdFromToken(token).then(function(id){
		if(id==undefined)
		{
			res.send({message:"error retrieving marks",success:false});
		}
		Marks.find({school:id,class:user_class,section:user_section}, function(err, marks){
			if(err)
			{
				res.send({message:err, success:false});
			}
			else
			{
				var data = []
				for(var i=0;i<marks.length;i++)
				{
					data.push({id:marks[i]._id, name:marks[i].name, class:user_class, section:user_section});
				}
				res.send({data:data, message:"successfully sent marks details", success: true});
			}
		});
	});
}

function getMarksById(req, res){
	var token = req.body.token;
	var id = req.body.id;
	// permission is 'view_any_marks'
	base.rbac.can(token, 'view_any_marks').then(function(bool){
		if(bool)
		{
			Marks.findOne({_id:id}, function(err, marks){
				if(err)
				{
					res.send({message:err, success: false});
				}
				else
				{
					getUsersOfRoleClassSectionforMarks(token, 'Student', marks.class, marks.section).then(function(data){
						var marks1 = [];
						for(var i=0;i<marks.marks.length;i++)
						{
							var temp = {};
							temp.user = marks.marks[i].user;
							temp.score = marks.marks[i].score;
							var b = false;
							for(var j=0;j<data.length;j++)
							{
								if(data[j]._id.toString()==temp.user.toString())
								{
									temp.name=data[j].name;
									temp.rollno = data[j].rollno;
									b = true;
									break;
								}
							}
							if(b)
								{
									marks1.push(temp);
								}
						}
						res.send({data:marks,marks: marks1, message:"successfully sent marks", success: true});
					});
				}
			});
		}
		else
		{
			Marks.findOne({_id:id}, function(err, marks){
				if(err)
				{
					res.send({message:err, success: false});
				}
				else
				{
					if(marks.name){
						Session.findOne({token:token}, function(err, session){
							if(err)
							{
								res.send({message:err, success: false});
							}
							else
							{
								User.findOne({_id:session.userid}, function(err, user){
									var user_marks = [];
									var user_data = {};
									user_data.class = marks.class;
									user_data.section = marks.section;
									user_data.name = marks.name;
									user_data.dates = marks.dates;
									user_data.total_marks = marks.total_marks;
									user_data.subjects = marks.subjects;
									var temp = {};
									temp.name = user.name;
									temp.rollno = user.rollno;
									for(var i=0;i<marks.marks.length;i++)
									{
										if(marks.marks[i].user.toString()==user._id.toString())
										{
											console.log("score:"+marks.marks[i].score);
											temp.score = marks.marks[i].score;
											break;
										}
									}

									user_marks.push(temp);
									res.send({data:user_data,marks: user_marks, message:"successfully sent marks", success: true});
								});
							}
						});
					}
					else
					{
						res.send({data:null, marks:null,success:true});
					}
				}
			});
		}
	});
}

function getUsersOfRoleClassSectionforMarks(token, user_role, user_class, user_section){
  var deferred = q.defer();
  var search_obj = {}
  if(user_role!=undefined)
  {
    search_obj.role=user_role;
  }
  // change permission to info_any_user
  base.rbac.can(token, 'info_any_user').then(function(bool){
    if(bool)
    {
      base.util.getSchoolIdFromToken(token).then(function(id){
        search_obj.school = id;
        User.find(search_obj, function(err, user){
          var data = [];
          var count=0;
          for(var i=0;i<user.length;i++)
          {
            for(var j=0;j<user[i].scope.length;j++)
            {
              if(user[i].scope[j].class==user_class && user[i].scope[j].section==user_section)
              {
                data[count++] = user[i];
                break;
              }
            }
          }
          deferred.resolve(data);
        });
      });
    }
    else
    {
    	deferred.reject("error");
    }
  });  
  return deferred.promise;
}

function createMarks(req, res){
	var token = req.body.token;
	var name = req.body.name;
	var school;
	var subjects = req.body.subjects.split(';');
	var dates = req.body.dates.split(';');
	var total_marks = req.body.total_marks.split(';');
	var user_class = req.body.class;
	var user_section = req.body.section;
	var userlist = req.body.userlist.split(';');
	var markslist = req.body.markslist.split(';');
	base.util.getSchoolIdFromToken(token).then(function(id){
		school = id;
		getUsersOfRoleClassSectionforMarks(token, 'Student', user_class, user_section).then(function(data){
			var marks = [];
			for(var i=0;i<userlist.length;i++)
			{
				var temp = {};
				temp.user = userlist[i];
				temp.score = markslist[i].split(',');
				marks.push(temp);
			}
			var data1 = {
				school: school,
				name: name,
				subjects: subjects,
				total_marks: total_marks,
				dates: dates,
				class: user_class,
				section: user_section,
				marks: marks
			}
			var m = new Marks(data1);
			m.save(function(err){
				if(err)
		        {
		          res.send({message:err,success: false});
		        }
		        else
		        {
		          res.send({message:"successfully created examination", success: true});
		        }
    		});
		});
	});
}

function editMarks(req, res){
	var token = req.body.token;
	var name = req.body.name;
	var marksid = req.body.marksid;
	var subjects = req.body.subjects.split(';');
	var dates = req.body.dates.split(';');
	var total_marks = req.body.total_marks.split(';');
	var user_class = req.body.class;
	var user_section = req.body.section;
	var userlist = req.body.userlist.split(';');
	var markslist = req.body.markslist.split(';');
	// base.util.getSchoolIdFromToken(token).then(function(id){
	// 	// school = id;
	// 	getUsersOfRoleClassSectionforMarks(token, 'Student', user_class, user_section).then(function(data){
			var marks = [];
			for(var i=0;i<userlist.length;i++)
			{
				var temp = {};
				temp.user = userlist[i];
				temp.score = markslist[i].split(',');
				marks.push(temp);
			}
			var data1 = {
				name: name,
				subjects: subjects,
				total_marks: total_marks,
				dates: dates,
				class: user_class,
				section: user_section,
				marks: marks
			}
			console.log(data1);
			Marks.update({_id:marksid},data1,function(err){
				if(err)
	            {
	              res.send({message: err, success:false});
	            }
	            else
	            {
	              res.send({message: "Successfully edited Examintion", success:true});
	            }
			});
			// var m = new Marks(data1);
			// m.save(function(err){
			// 	if(err)
		 //        {
		 //          res.send({message:err,success: false});
		 //        }
		 //        else
		 //        {
		 //          res.send({message:"successfully created examination", success: true});
		 //        }
   //  		});
	// 	});
	// });
}

function analytics(req, res){
	var token = req.body.token;
	var cs_scope = req.body.cs.split('-');
	var temp_class = cs_scope[0];
	var temp_section = cs_scope[1];
	base.util.getSchoolIdFromToken(token).then(function(id){
		if(id==undefined)
		{
			res.send({message:"error retrieving marks",success:false});
		}
		Marks.find({school:id,class:temp_class,section:temp_section}, function(err, marks){
			if(err)
			{
				res.send({message:err, success:false});
			}
			else
			{
				res.send(marks);
			}
		});
	});
	
}
module.exports = apiRoutes;