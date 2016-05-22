'use strict';

var mongoose = require('mongoose'),
    rbac = {},
    auth = {},
    util = {},
    User = mongoose.models.User,
    Session = mongoose.models.Session,
    q = require('q'),
    express = require('express'),
    School = mongoose.models.School;

// -- Functions of RBAC -------------------------------
// This function checks if a user has permission to perform action
rbac.can = function(token, permission)
{
  var deferred = q.defer();
  Session.findOne({token:token}, function(err,session){
    if(err)
    {
      deferred.reject(err);
      throw err;
    }
    else
    {
      User.findOne({_id:session.userid}, function(err, user){
        var userrole = user.role;
        if(!userrole)
          deferred.reject(userrole);
        //  return {message: "user role not defined",status: false};
        else
        {
          School.findOne({_id:user.school}, function(err, school){
            if(err)
            {
              deferred.reject(err);
              throw err;
            }
            else
            {
              var grants = school.grants;
              var obj;
              grants.forEach(function(object){
                if(object.role==userrole)
                {
                  obj = object;
                  return;
                }
              });
              var allow = false;
              for (var i = 0; i < obj.permissions.length && !allow; i++) {
                if (obj.permissions[i] == permission) {
                  allow = true;
                }
              }
              deferred.resolve(allow);
             
            }
          });
        }
      });
    }
  })
   return deferred.promise;
}

rbac.grant = function(){
	
};

//------------------------------------------------------------
// ---------- Util Functions -----------------------------

util.getSchoolIdFromToken = function(token){
  var deferred = q.defer();
  Session.findOne({token:token}, function(err,session){
    if(err)
    {
      deferred.reject(err);
      throw err;
    }
    else
    {
      User.findOne({_id:session.userid}, function(err, user){
        if(err)
          deferred.reject(err);
        else
        {
          School.findOne({_id:user.school}, function(err, school){
            if(err)
            {
              deferred.reject(err);
              throw err;
            }
            else
            {
              console.log(school);
              if(school){
                deferred.resolve(school._id);
              }
              else
                deferred.resolve(null);
            }
          });
        }
      });
    }
  })
   return deferred.promise;
}
util.getRollnoFromId = function(id)
{
  var deferred = q.defer();
  User.findOne({_id:id}, function(err, user){
    if(err)
    {
      deferred.reject(err);
    }
    else
    {
      deferred.resolve(user.rollno);
    }
  });
  return deferred.promise;
}

util.getUsersOfRoleClassSection = function(role,class1,section,token){
  var deferred = q.defer();
  var token = token;
  var user_role = role;
  var user_class = class1;
  var user_section = section;
  rbac.can(token, 'create_attendance').then(function(bool){
    if(bool)
    {
      util.getSchoolIdFromToken(token).then(function(id){
        User.find({school:id,role:user_role}, function(err, user){
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
      deferred.reject(err);
    }
  });  
  return deferred.promise;
}

//------------------------------------------------------------
exports.rbac = rbac;
exports.auth = auth;
exports.util = util;