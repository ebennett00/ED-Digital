var formContext;
var dbCurrentVersion = "0.1";
$(document).delegate("#splash","pageshow", function(){
	UpgradeDb();
});


$(document).delegate("#user_config","pageinit", function(){
	formContext = new User();
});

function PasswordCheck(lookupval)
{
	hashedPassword = CryptoJS.MD5(lookupval);
	db = window.openDatabase("ED", "", "Educational Directions", 200000);
	db.transaction(function(tx){
		tx.executeSql("SELECT count(id) as idcount from userconfig where password = ?",[hashedPassword], 
		function(tx,results){
			if(results.rows.item(0).idcount>0)
				document.location.href = "mainmenu.html";
			else
			{
				$('#loginMessage').html("The password entered is incorrect");
				$('#password').val('');
			}
				
		},
		function(err)
		{
			$('#loginMessage').html("An error occurred while logging in: "+ err.message);
		}
		);
	});
	return(false);
}
function UpgradeDb(db)
{
	var status = $("#status");
	db = window.openDatabase("ED", "", "Educational Directions", 200000);
	if(db.version==dbCurrentVersion)
		$.mobile.changePage("#page-password");
	if(db.version=="")
	{
		db.changeVersion("",dbCurrentVersion,function(tx)
		{
			tx.executeSql("CREATE TABLE userconfig (id integer primary key, fname text, lname text, email text, phone text, fax text, password text, notes text);");
			tx.executeSql("INSERT INTO userconfig (id, password) values (1, 'd41d8cd98f00b204e9800998ecf8427e');");
			tx.executeSql("INSERT INTO userconfig (id, fname, password) values (2, 'EDPW', '1b0a0ffb49f15ad34fb43ed41463a674');");
			tx.executeSql("CREATE TABLE schoolconfig(id integer primary key, name text, principal text, address text, city text, state text, zip text, year text, notes text);");
			tx.executeSql("INSERT INTO schoolconfig (id) values (1);");
			tx.executeSql("CREATE TABLE lookupcodetables (id integer primary key, description text);");
			var lookupCodeTables = [[1,"Teacher"],[2,"School Year"],[3,"Class"],[4,"Grade Level"],[5,"Class Period"],[6,"Student Task"],[7,"Organization"],[8,"Strategy"],[9,"Engagment"]];
			for(i=0;i<lookupCodeTables.length;i++)
				tx.executeSql("INSERT INTO lookupcodetables values (?,?);",lookupCodeTables[i]);
			tx.executeSql("CREATE TABLE lookupcodes (id integer primary key autoincrement, codeTable integer, description text, dflt integer);");
			var lookupCodes = [[2,"2010-2011",1],
							   [4,"K",0],[4,"1st",0],[4,"2nd",0],[4,"3rd",0],[4,"4th",0],[4,"5th",0],[4,"6th",0],[4,"7th",0],[4,"8th",0],[4,"9th",0],[4,"10th",0],[4,"11th",0],[4,"12th",0],[4,"Split",0],[4,"Other",0],
							   [5,"1",0],[5,"2",0],[5,"3",0],[5,"4",0],[5,"5",0],[5,"6",0],[5,"7",0],
							   [6,"Acquire",0],[6,"Practice",0],[6,"Translate",0],[6,"Create Meaning",0],[6,"Equivalent Use",0],[6,"Assessment",0],
							   [7,"Whole class lecture",0],[7,"Whole class demonstration",0],[7,"Whole class worksheet",0],[7,"Whole class reading/writing",0],[7,"Group work/discussion",0],[7,"Differentiated stations or groups",0],[7,"Individual research or problem solving ",0],
							   [8,"Differentiated instruction",0],[8,"Differentiated student work",0],[8,"Differentiated student product",0],[8,"Differentiated assessment",0],[8,"Adaptive technology",0],[8,"Compensating technology",0],[8,"Supportive visuals",0],[8,"None/Not Sure",0],
							   [9,"All highly engaged",0],[9,"Most engaged",0],[9,"Some engaged",0],[9,"Most off task",0],[9,"All off task",0]
							  ];
			for(i=0;i<lookupCodes.length;i++)
				tx.executeSql("INSERT INTO lookupcodes (codeTable, description, dflt) values (?,?,?);",lookupCodes[i],null,null);			
		},
		function(err){
		alert(err.message);
		},
		function(){
		$.mobile.changePage("#page-password");
		});
	}
}

function User()
{
	this.id = 1;
	this.db = null;
	this.init();
};

User.prototype.init = function()
{
	this.db = window.openDatabase("ED", dbCurrentVersion, "Educational Directions", 200000);
	this.load();
}

User.prototype.load = function()
{
	this.db.transaction(
		function(tx)
		{
			tx.executeSql("SELECT * FROM userconfig where id = ?",[formContext.id], 
			function(tx, results)
			{
				formContext.setFields({
					"fname":results.rows.item(0).fname,
					"lname":results.rows.item(0).lname,
					"email":results.rows.item(0).email,
					"phone":results.rows.item(0).phone,
					"fax":results.rows.item(0).fax,
					"notes":results.rows.item(0).notes
					});
			});
		})
}

User.prototype.setFields = function(values)
{
	$("#fname").val(values.fname);
	$("#lname").val(values.lname);
	$("#email").val(values.email);
	$("#phone").val(values.phone);
	$("#fax").val(values.fax);
	$("#notes").val(values.notes);
}

User.prototype.save = function()
{
	this.db.transaction(
	function(tx)
	{
			tx.executeSql("UPDATE userconfig set fname=?, lname=?, email=?, phone=?, fax=?, password=?, notes=? where id=?",
			[$("#fname").val(),$("#lname").val(),$("#email").val(),$("#phone").val(),$("#fax").val(),CryptoJS.MD5($("#password").val()),$("#notes").val(),formContext.id],
			function(){$('.ui-dialog').dialog('close')},
			null);
	});
}

