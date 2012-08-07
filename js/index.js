var formContext;

$(document).delegate("#user_config","pageinit", function(){
	formContext = new User();
});

function User()
{
	this.id = 1;
	this.db = null;
	this.init();
};

User.prototype.init = function()
{
	this.db = window.openDatabase("ED", "1.0", "Educational Directions", 200000);
	this.load();
}

User.prototype.load = function()
{
	this.db.transaction(
		function(tx)
		{
			//make sure the userconfig table exists
			tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='userconfig';",[],
			function(tx,results)
			{
				if(results.rows.length != 1)
				{
					//if it doesnt exist create it and populate the default user
					tx.executeSql("CREATE TABLE userconfig (id integer primary key, fname, lname, password);");
					tx.executeSql("INSERT INTO userconfig (id) values (1);")
				}
			});
		});
		
	this.db.transaction(
		function(tx)
		{
			tx.executeSql("SELECT * FROM userconfig where id = ?",[formContext.id], 
			function(tx, results)
			{
				formContext.setFields({"fname":results.rows.item(0).fname,"lname":results.rows.item(0).lname,"password":results.rows.item(0).password});
			});
		})
}

User.prototype.setFields = function(values)
{
	$("#fname").val(values.fname);
	$("#lname").val(values.lname);
	$("#password").val(values.password);
}

User.prototype.save = function()
{
	this.db.transaction(
	function(tx)
	{
			tx.executeSql("UPDATE userconfig set fname=?, lname=?, password=? where id=?",[$("#fname").val(),$("#lname").val(),$("#password").val(),formContext.id],
			function(){$('.ui-dialog').dialog('close')},
			null);
	});
}

