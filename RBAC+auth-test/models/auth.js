'use strict';

// Here the schemas and collections are defined.

var mongoose = require('mongoose'),
		Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;

// Schema for User

var userFields = {
	name: {type: String},
	school: Schema.Types.ObjectId,
	role: {type: String},
	scope: [{
		class: {type: String},
		section: {type: String},
		subjects: [String]
	}],
	email: {type: String},
	phno: {type: String},
	parent: {Boolean},
	child: Schema.Types.ObjectId,
	password: {type: String},
	rollno: {type: String}
}

var userSchema = new Schema(userFields);
exports.User = mongoose.model('User', userSchema);

// Schema for School

var schoolFields = {
	adminid : Schema.Types.ObjectId,
	name : {type : String},
	roles : [String],
	permissions : [String],
	scope: [{
		class: {type: String},
		section: {type: String},
		subjects: [String]
	}],
	grants : [{
		role : {type : String},
		permissions : [String],
	}],
	subscriptions : [String]
}

var schoolSchema = new Schema(schoolFields);
exports.School = mongoose.model('School', schoolSchema);

// Schema for Session

var sessionFields = {
	userid : Schema.Types.ObjectId,
	token : {type: String}
}

var sessionSchema = new Schema(sessionFields);
exports.Session = mongoose.model('Session', sessionSchema);

// Schema for Attendance

var attendanceFields = {
	school: Schema.Types.ObjectId,
	class: {type: String},
	section: {type: String},
	subject: {type: String},
	date: {type: Date},
	count: {type: Number},
	values: [{
		user: Schema.Types.ObjectId,
		value: [String],
		period: [String]
	}]
}

var attendanceSchema = new Schema(attendanceFields);
exports.Attendance = mongoose.model('Attendance', attendanceSchema);

// Schema for Marks

var marksFields = {
	school: Schema.Types.ObjectId, 
	name : {type : String},
	subjects : [{
		type : String
	}],
	total_marks : [{
		type : String
	}],
	dates : [{
		type : Date
	}],
	class : {type : String},
	section : {type : String},
	marks : [{
		user : Schema.Types.ObjectId,
		score : [{type: String}]
	}]
}

var marksSchema = new Schema(marksFields);
exports.Marks = mongoose.model('Marks', marksSchema);

var selfCalendarFields = {
	school: Schema.Types.ObjectId,
	userid: Schema.Types.ObjectId,
	eventList: [
				{
                    createdOn: {type: Date}, 	
					title: {type : String},
                    allDay: {type : Boolean},
                    start: {type: Date},
                    end: {type: Date},
                    description: {type: String},
                    location: {type : String},
                    palette: {type: String},
                    stick: {type: Boolean},
                    backgroundColor: {type: String},
                    borderColor: {type: String},
                    textColor: {type: String}
				}
			]
}

var selfCalendarSchema = new Schema(selfCalendarFields);
exports.SelfCalendar = mongoose.model('SelfCalendar', selfCalendarSchema);

var globalCalendarFields = {
	school: Schema.Types.ObjectId,
	eventList: [
				{	
					// _id: {type: Date},
                    owner: Schema.Types.ObjectId,
                    createdOn: {type: Date}, 	
                    classAndSubject: [{
                    	class: {type: String},
                    	section: {type: String},
                    	subjects: [
                    		{type: String}
                    		]
                    	}],
                    roles: [
                    	{type: String}
                    	]
                    ,
					title: {type : String},
					sharedEvent: {type: Boolean},
                    allDay: {type : Boolean},
                    start: {type: Date},
                    end: {type: Date},
                    description: {type: String},
                    location: {type : String},
                    palette: {type: String},
                    stick: {type: Boolean},
                    backgroundColor: {type: String},
                    borderColor: {type: String},
                    textColor: {type: String}
				}
			] 
	
}

var calendarSchema = new Schema(globalCalendarFields);
exports.GlobalCalendar = mongoose.model('GlobalCalendar', calendarSchema);