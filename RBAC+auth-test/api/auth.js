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

//-----------APIs------------------------------------------
// API to authenticate the user. It takes user ID or emailID or name and password. It returns a token.
apiRoutes.post('/authenticate', authenticate);

// route middleware to authenticate and check token
apiRoutes.use(validate);

// API to logout a user. It takes token as input.
apiRoutes.post('/logout', logout);

// API to add a user. It takes a json object as input
apiRoutes.post('/add/user', addUser);

// API to delete user
apiRoutes.post('/delete/user', deleteUser);

// API to check if a user has permission.
apiRoutes.post('/haspermission', checkPermission);

// API to add a new role
apiRoutes.post('/add/role', addRole);

// API to delete a role
apiRoutes.post('/delete/role', deleteRole);

// API to list all user of a school. Returns IDs of all the users who belong to a school
apiRoutes.post('/users/all', getUsers);

// API to give information of any user by their ID
apiRoutes.post('/user/info', getAnyUserInfo);

// API to give information of self user by their ID
apiRoutes.post('/user/selfinfo', getSelfUserInfo);
apiRoutes.post('/user/selfscope', getSelfUserScope);

// API to list all roles present in a school
apiRoutes.post('/roles', listRoles);

// API to list all the permissions in a school
apiRoutes.post('/permissions', listPermissions);

// API to list all the users of a particular role of a school. It returns IDs
apiRoutes.post('/roles/users', getUsersOfAParticularRole);

// API to list all the users of a particular role and of a particular class and section. It return IDs
apiRoutes.post('/users/specific', getUsersOfRoleClassSection);

// API to add a new school
apiRoutes.post('/add/school', addSchool);

// API to edit a school
apiRoutes.post('/edit/school', editSchool);

// API to edit a self user account
apiRoutes.post('/edit/user/self', editSelfUser);

// API to edit any user account
apiRoutes.post('/edit/user/any', editAnyUser);

// API to get school information
apiRoutes.post('/school/info', getSchoolInfo);
apiRoutes.post('/school/roles', getSchoolRoles);

// API to get all school info
apiRoutes.post('/school/list', getSchoolList);

app.use('/api', apiRoutes);
//----------------------------------------------------------
// --------- Functions--------------------------------------
function authenticate(req, res) {
  // find the user
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {
        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, "temporarysecret", {
          expiresInMinutes: 1440 // expires in 24 hours
        });
        var id = user._id;
        console.log("id:"+id);
        Session.remove({userid:id}, function(err){
          session = new Session({userid: id, token: token});
          session.save();
          res.json({
            success: true,
            message: 'successfully Logged in',
            token: token
          });
        });
      }   
    }
  });
}

function validate(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.param('token') || req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, "temporarysecret", function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;  
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({ 
      success: false, 
      message: 'No token provided.'
    }); 
  } 
}

function logout(req, res){
  Session.remove({token: req.body.token}, function(err){
    if(err)
      res.send({message: err});
    else
    {
      res.send({message:"Logged out.",success:true});
    }
  })
}

function addUser(req,res){
  var data = {};
  var token = req.body.token;
  if(req.body.name)
    data.name = req.body.name;
  if(req.body.role)
    data.role = req.body.role;
  if(req.body.email)
    data.email = req.body.email;
  if(req.body.phno)
    data.phno = req.body.phno;
  if(req.body.rollno)
    data.rollno = req.body.rollno;
  if(req.body.parent!=undefined)
    data.parent = req.body.parent;
  if(req.body.child)
    data.child = req.body.child;
  if(req.body.password)
    data.password = req.body.password;
  if(req.body.class && req.body.section)
  {
    classes = req.body.class.split(';');
    sections = req.body.section.split(';');
    subjects = req.body.subject.split(';');
    var len = classes.length;
    data.scope = [];
    for(var i=0;i<len;i++)
    {
      var temp = {};
      temp.class = classes[i];
      temp.section = sections[i];
      temp.subjects = subjects[i].split(',');
      console.log("subjects:"+temp.subject);
      data.scope[i] = temp;
    }
  }
  if(req.body.schoolid)
  {
    data.school = req.body.schoolid;
    var user = new User(data);
          user.save(function(err){
            if(err)
              res.send({message:err,success:false});
            else
            {
              res.send({message:"successfully added", success:true});
            }
          });
  }  
  else
  {
    base.util.getSchoolIdFromToken(token).then(function(id){
          data.school = id;
          var user = new User(data);
          user.save(function(err){
            if(err)
              res.send({message:err,success:false});
            else
            {
              res.send({message:"successfully added", success:true});
            }
          });
      });
  }
  // base.rbac.can(token, 'create_user').then(function(bool){
    // if(bool)
    // {
      
  //   }
  //   else
  //     res.send({message: "not enough privilege", success: false});
  // });
}

function editSelfUser(req, res){
  var data = {};
  var token = req.body.token;
  if(req.body.name)
    data.name = req.body.name;
  if(req.body.role)
    data.role = req.body.role;
  if(req.body.email)
    data.email = req.body.email;
  if(req.body.phno)
    data.phno = req.body.phno;
  if(req.body.parent!=undefined)
    data.parent = req.body.parent;
  if(req.body.child)
    data.child = req.body.child;
  if(req.body.password)
    data.password = req.body.password;
  if(req.body.class && req.body.section && req.body.subject)
  {
    classes = req.body.class.split(';');
    sections = req.body.section.split(';');
    subjects = req.body.subject.split(';');
    var len = classes.length;
    data.scope = [];
    for(var i=0;i<len;i++)
    {
      var temp = {};
      temp.class = classes[i];
      temp.section = sections[i];
      temp.subjects = subjects[i].split(',');
      data.scope[i] = temp;
    }
  }
  base.rbac.can(token, 'edit_self_user').then(function(bool){
    if(bool)
    {
      Session.findOne({token:token}, function(err, session){
        if(err)
        {
          res.send({message: err, success:false});
        }
        else
        {
          User.update({_id:session.userid}, data, function(err){
            if(err)
            {
              res.send({message: err, success:false});
            }
            else
            {
              res.send({message: "Successfully edited user", success:true});
            }
          });
        }
      });
    }
    else
      res.send({message: "not enough privilege", success: false});
  });
}

function editAnyUser(req, res){
  var data = {};
  var token = req.body.token;
  var userid = req.body.userid;
  if(req.body.name)
    data.name = req.body.name;
  if(req.body.role)
    data.role = req.body.role;
  if(req.body.email)
    data.email = req.body.email;
  if(req.body.phno)
    data.phno = req.body.phno;
  if(req.body.rollno)
    data.rollno = req.body.rollno;
  if(req.body.parent!=undefined)
    data.parent = req.body.parent;
  if(req.body.child)
    data.child = req.body.child;
  if(req.body.password)
    data.password = req.body.password;
  if(req.body.class && req.body.section)
  {
    classes = req.body.class.split(';');
    sections = req.body.section.split(';');
    subjects = req.body.subject.split(';');
    var len = classes.length;
    data.scope = [];
    for(var i=0;i<len;i++)
    {
      var temp = {};
      temp.class = classes[i];
      temp.section = sections[i];
      temp.subjects = subjects[i].split(',');
      data.scope[i] = temp;
    }
  }
  base.rbac.can(token, 'edit_any_user').then(function(bool){
    if(bool)
    {
      User.update({_id:userid}, data, function(err){
            if(err)
            {
              res.send({message: err, success:false});
            }
            else
            {
              res.send({message: "Successfully edited user", success:true});
            }
          });
    }
    else
      res.send({message: "not enough privilege", success: false});
  });
}

function deleteUser(req, res){
  var token = req.body.token;
  var id = req.body.id;
  base.rbac.can(token, 'delete_user').then(function(bool){
    if(bool)
    {
      User.remove({_id:id}, function(err){
      if(err)
        res.send({message:"Something went wrong",success:false});
      else
        res.send({message:"successfully deleted user",success: true});
    });
    }
    else
    {
      res.send({message: "not enough privilege", success: false});
    }
  });
}

function checkPermission(req, res){
  var token = req.body.token;
  var permission = req.body.permission;
  base.rbac.can(token, permission).then(function(bool){
    if(bool)
    {
      res.send({message: "has permission", success: true});
    }
    else
    {
      res.send({message: "not enough privilege", success: false}); 
    }
  });
}

function addRole(req, res){
  var token = req.body.token;
  var newrole = req.body.role;
  var permissions = [];
  if(req.body.permission)
    permissions = req.body.permission.split(',');
  base.rbac.can(token, 'add_role').then(function(bool){
    if(bool)
    {
      base.util.getSchoolIdFromToken(token).then(function(id){
        School.findOne({_id:id}, function(err, school){
          if(err)
          {
            res.send({message: err, success:false});
          }
          var roles = school.roles;
          roles[roles.length] = newrole;
          var grants = school.grants;
          grants[grants.length] = {role: newrole,permissions: permissions};
          School.update({_id:id},{roles:roles,grants:grants}, function(err){
            if(err)
            {
              res.send({message: "could not add role", success: false});
            }
            else
              res.send({message: "successfully added a role to a school", success: true});
          });
        });
      });
    }
    else
    {
      res.send({message: "not enough privilege", success: false});
    }
  });
}

function deleteRole(req, res){
  var token = req.body.token;
  var role = req.body.role;
  base.rbac.can(token, 'edit_role').then(function(bool){
    if(bool)
    {
      base.util.getSchoolIdFromToken(token).then(function(id){
        School.findOne({_id:id}, function(err, school){
          console.log(school);
          if(err)
          {
            res.send({message: err, success:false});
          }
          var roles = school.roles;
          console.log("roles:"+roles);
          var index = roles.indexOf(role);
          if (index > -1) {
            roles.splice(index, 1);
          }
          console.log("updated roles: "+roles)
          var count;
          var grants = school.grants;
          console.log("grants:"+grants);
          for(var i=0;i<grants.length;i++)
          {
            if(grants[i].role==role)
            {
              count = i;
              break;
            }
          }
          grants.splice(count,1);
          console.log("updated grants:"+grants);
          School.update({_id:id},{roles:roles,grants:grants}, function(err){
            console.log("err:"+err);
            if(err)
            {
              res.send({message: err, success:false});
            }
            else
              res.send({message: "successfully deleted a role from a school", success: true});
          });
        });
      });
    }
    else
    {
      res.send({message: "not enough privilege", success: false});
    }
  });
}

function getUsers(req, res)
{
  var token = req.body.token;
  base.rbac.can(token, 'list_users').then(function(bool){
    if(bool)
    {
      base.util.getSchoolIdFromToken(token).then(function(id){
        User.find({school:id}, function(err, user){
          if(err)
          {
            res.send({message: err, success:false});
          }
          var ids = [];
         for(var i=0;i<user.length;i++)
         {
          ids[i] = user[i]._id;
         }
         res.send({IDs: ids, success:true, message: "successfully sent IDs"});
        });
      }); 
    }
    else
    {
      res.send({message: "not enough privilege", success: false});
    }
  });
}

function getAnyUserInfo(req, res){
  var token = req.body.token;
  var id = req.body.id;
  base.rbac.can(token, 'info_any_user').then(function(bool){
    if(bool)
    {
      Session.findOne({token:token}, function(err,session){
    if(err)
    {
      res.send({message: err, success:false});
    }
    else
    {
      User.findOne({_id:id}, function(err, user){
        if(err)
        {

        }
        else
        {
          res.send({info:user, message: "successfully sent user info", success: true});
        }
      });
    }
  })
    }
    else
    {
      res.send({message: "not enough privilege", success: false});
    }
  });
}

function getSelfUserInfo(req, res){
  var token = req.body.token;
  base.rbac.can(token, 'info_self_user').then(function(bool){
    if(bool)
    {
      Session.findOne({token:token}, function(err,session){
    if(err)
    {
      res.send({message: err, success:false});
      throw err;
    }
    else
    {
      User.findOne({_id:session.userid}, function(err, user){
        if(err)
          res.send({message: err, success:false});
        else
        {
          res.send({info:user, message: "successfully sent user info", success: true});
        }
      });
    }
  })
    }
    else
    {
      res.send({message: "not enough privilege", success: false});
    }
  });
}

function getSelfUserScope(req, res){
  var token = req.body.token;
  base.rbac.can(token, 'info_self_user').then(function(bool){
    if(bool)
    {
      Session.findOne({token:token}, function(err,session){
    if(err)
    {
      res.send({message: err, success:false});
      throw err;
    }
    else
    {
      User.findOne({_id:session.userid}, function(err, user){
        if(err)
          res.send({message: err, success:false});
        else
        {
          res.send({scope:user.scope, message: "successfully sent user info", success: true});
        }
      });
    }
  })
    }
    else
    {
      res.send({message: "not enough privilege", success: false});
    }
  });
}


function listRoles(req, res){
  var token = req.body.token;
  base.rbac.can(token, 'list_roles').then(function(bool){
    if(bool)
    {
      base.util.getSchoolIdFromToken(token).then(function(id){
        School.findOne({_id:id},function(err, school){
          if(err)
          {
            res.send({message: err, success:false});
          }
          else
          {
            res.send({roles: school.roles, message: "successfully sent all the roles of a school", success: true});
          }
        });
      });
    }
    else
    {
      res.send({message: "not enough privilege", success: false});
    }
  });  
}

function listPermissions(req, res){
  var token = req.body.token;
  base.rbac.can(token, 'list_permissions').then(function(bool){
    if(bool)
    {
      base.util.getSchoolIdFromToken(token).then(function(id){
        School.findOne({_id:id},function(err, school){
          if(err)
          {
            res.send({message: err, success:false});
          }
          else
          {
            res.send({roles: school.permissions, message: "successfully sent all the roles of a school", success: true});
          }
        });
      });
    }
    else
    {
      res.send({message: "not enough privilege", success: false});
    }
  });  
}

function getUsersOfAParticularRole(req, res){
  var token = req.body.token;
  var role = req.body.role;
  base.rbac.can(token, 'list_users').then(function(bool){
    if(bool)
    {
      base.util.getSchoolIdFromToken(token).then(function(id){
        User.find({school:id,role:role}, function(err, user){
          var ids = [];
          for(var i=0;i<user.length;i++)
          {
            ids[i] = user[i]._id;
          }
          res.send({IDs:ids, message:"successfully sent all the ids of a user with a given role", success: true});
        });
      });
    }
    else
    {
      res.send({message: "not enough privilege", success: false});
    }
  });  
}

function getUsersOfRoleClassSection(req, res){
  var token = req.body.token;
  var user_role = req.body.role;
  var user_class = req.body.class;
  var user_section = req.body.section;
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
          res.send({users: data, message:"successfully sent all the details of users with the given role", success: true});
        });
      });
    }
    else
    {
      res.send({message: "not enough privilege", success: false});
    }
  });  
}
//----------------------------------------------------------

function addSchool(req, res){
  var token = req.body.token;
  var data = {};
  if(req.body.adminid)
    data.adminid = req.body.adminid;
  if(req.body.name)
    data.name = req.body.name;
  if(req.body.roles)
    data.roles = req.body.roles.split(';');
  if(req.body.permissions)
    data.permissions = req.body.permissions.split(';');
  if(req.body.subscriptions)
    data.subscriptions = req.body.subscriptions.split(';');
  if(req.body.class && req.body.section && req.body.subjects)
  {
    var classes = req.body.class.split(';');
    var sections = req.body.section.split(';');
    var subjects = req.body.subjects.split(';');
    console.log("subjects combined:"+subjects);
    var len = classes.length;
    data.scope = [];
    for(var i=0;i<len;i++)
    {
      var temp = {};
      temp.class = classes[i];
      temp.section = sections[i];
      temp.subjects = subjects[i].split(',');
      console.log("subjects:"+temp.subject);
      data.scope[i] = temp;
    }
  }
  if(req.body.role_grant)
  {
    var roles = req.body.role_grant.split(';');
    var permissions = req.body.permissions_grant.split(';');
    data.grants = [];
    for(var i=0;i<roles.length;i++)
    {
      var temp = {};
      temp.role = roles[i];
      temp.permissions = permissions[i].split(',');
      data.grants[i] = temp;
    }
  }
  // base.rbac.can(token, 'create_school').then(function(bool){
    // if(bool)
    // {
      var school = new School(data);
      school.save(function(err, school1){
        if(err)
        {
          res.send({message:err,success: false});
        }
        else
        {
          res.send({message:"successfully created a school",id: school1.id, success: true});
        }
      });
    // }
    // else
    // {
    //   res.send({message: "not enough privilege", success: false});
    // }
  // });
}

function editSchool(req, res){
  var token = req.body.token;
  var data = {};
  if(req.body.adminid)
    data.adminid = req.body.adminid;
  if(req.body.name)
    data.name = req.body.name;
  if(req.body.roles)
    data.roles = req.body.roles.split(';');
  if(req.body.permissions)
    data.permissions = req.body.permissions.split(';');
  if(req.body.subscriptions)
    data.subscriptions = req.body.subscriptions.split(';');
  if(req.body.class && req.body.section && req.body.subjects)
  {
    var classes = req.body.class.split(';');
    var sections = req.body.section.split(';');
    var subjects = req.body.subjects.split(';');
    console.log("subjects combined:"+subjects);
    var len = classes.length;
    data.scope = [];
    for(var i=0;i<len;i++)
    {
      var temp = {};
      temp.class = classes[i];
      temp.section = sections[i];
      temp.subjects = subjects[i].split(',');
      console.log("subjects:"+temp.subject);
      data.scope[i] = temp;
    }
  }
  if(req.body.role_grant)
  {
    var roles = req.body.role_grant.split(';');
    var permissions = req.body.permissions_grant.split(';');
    data.grants = [];
    for(var i=0;i<roles.length;i++)
    {
      var temp = {};
      temp.role = roles[i];
      temp.permissions = permissions[i].split(',');
      data.grants[i] = temp;
    }
  }
  base.rbac.can(token, 'edit_school').then(function(bool){
    if(bool)
    {
      base.util.getSchoolIdFromToken(token).then(function(id){
        School.update({_id:id},data, function(err){
            if(err)
            {
              res.send({message: err, success: false});
            }
            else
              res.send({message: "successfully edited a school", success: true});
          });
      });
    }
    else
    {
      res.send({message: "not enough privilege", success: false});
    }
  });
}

function getSchoolInfo(req, res)
{
  var token = req.body.token;
  base.util.getSchoolIdFromToken(token).then(function(id){
    if(id){
      School.findOne({_id:id}, function(err, school){
      if(err)
      {
        res.send({message: err, success: false});
      }
      else
      {
        res.send({message: "successfully sent school info", data: school, success: true});
      }
    });
    }
    else
      {
        res.send({message: "", data: null, success: true});
      }
  });
}

function getSchoolRoles(req, res)
{
  var token = req.body.token;
  base.util.getSchoolIdFromToken(token).then(function(id){
    School.findOne({_id:id}, function(err, school){
      if(err)
      {
        res.send({message: err, success: false});
      }
      else
      {
        res.send({message: "successfully sent school info", roles: school.roles, success: true});
      }
    });
  });
}

function getSchoolList(req, res)
{
  var token = req.body.token;
  // base.rbac.can(token, 'create_user').then(function(bool){
    School.find({}, function(err, school){
      if(err)
      {
        res.send({message: err, success: false});
      }
      else
      {
        res.send({message: "successfully sent school info", data: school, success: true});
      }
    });
  // });  
}

module.exports = apiRoutes;
