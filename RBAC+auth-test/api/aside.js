var express = require('express'),
    mongoose = require('mongoose'),
    q = require('q'),
    User = mongoose.models.User,
    Session = mongoose.models.Session,
    School = mongoose.models.School;
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var app = express();
var apiRoutes = express.Router(); 
var base = require('../lib/base.js');
var apiRoutes = require('./auth.js');

apiRoutes.post('/aside', aside);

function aside(req, res){
	var token = req.body.token;
	Session.findOne({token:token}, function(err,session){
		User.findOne({_id:session.userid}, function(err, user){
			// console.log(user)
			// if(user.role == "Teacher")
			// {
			// 	var data = {};
			// 	data.type = "aside";
			// 	data.data = [];
			// 	data.data[0] = {type:"header", name:"Academics", data:
			// 		[
			// 			{
			// 				type:"dropdown", name:"Classes", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", data:
			// 				[
			// 					{
			// 						type:"button", name:"1 A", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 					},
			// 					{
			// 						type:"button", name:"1 B", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 					},
			// 					{
			// 						type:"button", name:"2 A", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 					},
			// 					{
			// 						type:"button", name:"2 B", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 					}
			// 				]
			// 			},
			// 			{
			// 				type:"button", name:"Examinations", state: 'triangular.admin-default.marks', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Attendance", state: 'triangular.admin-default.attendance', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Messages", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			}
			// 		]
			// 	}
			// 	data.data[1] = {type:"header", name:"Personal", data:
			// 		[
			// 			{
			// 				type:"button", name:"To-do", state: 'triangular.admin-default.todo', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Calendar", state: 'triangular.admin-calendar.calendar', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			}/*,
			// 			{
			// 				type:"button", name:"Notes", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			}*/
			// 		]
			// 	}
			// 	res.send(data);
			// }
			// else if(user.role=="Student")
			// {
			// 	var data = {};
			// 	data.type = "aside";
			// 	data.data = [];
			// 	data.data[0] = {type:"header", name:"Academics", data:
			// 		[
			// 			{
			// 				type:"dropdown", name:"Subjects", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", data:
			// 				[
			// 					{
			// 						type:"button", name:"English", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 					},
			// 					{
			// 						type:"button", name:"Hindi", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 					},
			// 					{
			// 						type:"button", name:"Sanskrit", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 					},
			// 					{
			// 						type:"button", name:"Mathematics", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 					},
			// 					{
			// 						type:"button", name:"Science", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 					},
			// 					{
			// 						type:"button", name:"Social Studies", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 					}
			// 				]
			// 			},
			// 			{
			// 				type:"button", name:"Users", state: 'triangular.admin-default.administration', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Marks", state: 'triangular.admin-default.marks', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Attendance", state: 'triangular.admin-default.attendance', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Messages", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			}
			// 		]
			// 	}
			// 	data.data[1] = {type:"header", name:"Personal", data:
			// 		[
			// 			{
			// 				type:"button", name:"To-do", state: 'triangular.admin-default.todo', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Calendar", state: 'triangular.admin-calendar.calendar', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Notes", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			}
			// 		]
			// 	}
			// 	res.send(data);
			// }
			// else if(user.role=="Parent")
			// {
			// 	var data = {};
			// 	data.type = "aside";
			// 	data.data = [];
			// 	data.data[0] = {type:"header", name:"Academics", data:
			// 		[
			// 			{
			// 				type:"button", name:"Examinations", state: 'triangular.admin-default.marks', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Attendance", state: 'triangular.admin-default.attendance', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Messages", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			}
			// 		]
			// 	}
			// 	data.data[1] = {type:"header", name:"Personal", data:
			// 		[
			// 			{
			// 				type:"button", name:"To-do", state: 'triangular.admin-default.todo', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Calendar", state: 'triangular.admin-calendar.calendar', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			}/*,
			// 			{
			// 				type:"button", name:"Notes", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			}*/
			// 		]
			// 	}
			// 	res.send(data);
			// }
			// else if(user.role=="Admin")
			// {
			// 	console.log("coming	")
			// 	var data = {};
			// 	data.type = "aside";
			// 	data.data = [];
			// 	data.data[0] = {type:"header", name:"Academics", data:
			// 		[
			// 			{
			// 				type:"button", name:"Users", state: 'triangular.admin-default.administration', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			/*{
			// 				type:"button", name:"School Information", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},*/
			// 			{
			// 				type:"button", name:"Examinations", state: 'triangular.admin-default.marks', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Attendance", state: 'triangular.admin-default.attendance', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			}/*,
			// 			{
			// 				type:"button", name:"Messages", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			}*/
			// 		]
			// 	}
			// 	data.data[1] = {type:"header", name:"Personal", data:
			// 		[
			// 			{
			// 				type:"button", name:"To-do", state: 'triangular.admin-default.todo', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Calendar", state: 'triangular.admin-calendar.calendar', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			}/*,
			// 			{
			// 				type:"button", name:"Notes", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			}*/
			// 		]
			// 	}
			// 	res.send(data);
			// }
			// else if(user.role=="Principal")
			// {
			// 	var data = {};
			// 	data.type = "aside";
			// 	data.data = [];
			// 	data.data[0] = {type:"header", name:"Academics", data:
			// 		[
			// 			{
			// 				type:"button", name:"Users", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"School Information", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Examinations", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Attendance", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Messages", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			}
			// 		]
			// 	}
			// 	data.data[1] = {type:"header", name:"Personal", data:
			// 		[
			// 			{
			// 				type:"button", name:"To-do", state: 'triangular.admin-default.todo', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			},
			// 			{
			// 				type:"button", name:"Calendar", state: 'triangular.admin-calendar.calendar', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			}/*,
			// 			{
			// 				type:"button", name:"Notes", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
			// 			}*/
			// 		]
			// 	}
			// 	res.send(data);
			// }
			if(user.role=="Tool Admin")
			{
				var data = {};
				data.type = "aside";
				data.data = [];
				data.data[0] = {type:"header", name:"Academics", data:
					[
						{
							type:"button", name:"Schools", state: 'triangular.admin-default.school', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
						}
						// {
						// 	type:"button", name:"To-do", state: 'triangular.admin-default.todo', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
						// },
						// {
						// 	type:"button", name:"Calendar", state: 'triangular.admin-calendar.calendar', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
						// }
					]
				}
				res.send(data);
			}
			else if(user.role=="Admin")
			{
				var data = {};
				data.type = "aside";
				data.data = [];
				data.data[0] = {type:"header", name:"Academics", data:
					[
						{
							type:"button", name:"Users", state: 'triangular.admin-default.administration', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
						},
						{
							type:"button", name:"School Information", state: 'triangular.admin-default.schoolinfo', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
						},
						// {
						// 	type:"button", name:"Examinations", state: 'triangular.admin-default.marks', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
						// },
						// {
						// 	type:"button", name:"Attendance", state: 'triangular.admin-default.attendance', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
						// },
						{
							type:"button", name:"Messages", state: 'triangular.admin-default.messaging', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
						},
						{
							type:"button", name:"Calendar", state: 'triangular.admin-calendar.calendar', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
						}
					]
				}
				res.send(data);
			}
			else
			{
				var data = {};
				data.type = "aside";
				data.data = [];
				data.data[0] = {type:"header", name:"Academics", data:
					[
						{
							type:"button", name:"Users", state: 'triangular.admin-default.administration', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
						},
						/*{
							type:"button", name:"School Information", material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
						},*/
						{
							type:"button", name:"Examinations", state: 'triangular.admin-default.marks', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
						},
						{
							type:"button", name:"Attendance", state: 'triangular.admin-default.attendance', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
						},
						{
							type:"button", name:"Messages", state: 'triangular.admin-default.messaging', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
						},
						{
							type:"button", name:"Calendar", state: 'triangular.admin-calendar.calendar', material_icon_name:"play_circle_outline", icon_image_path: "../assets/images/i_a.svg", url_client:"/temp", url_server:"/main/sample"
						}
					]
				}
				res.send(data);
			}	
		});
	});
}

module.exports = apiRoutes;