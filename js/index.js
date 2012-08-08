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
	this.db = window.openDatabase("ED", "1.1", "Educational Directions", 200000);
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
					tx.executeSql("CREATE TABLE userconfig (id integer primary key, fname, lname, email, phone, fax, password,notes);");
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
				formContext.setFields({
					"fname":results.rows.item(0).fname,
					"lname":results.rows.item(0).lname,
					"email":results.rows.item(0).email,
					"phone":results.rows.item(0).phone,
					"fax":results.rows.item(0).fax,
					"password":results.rows.item(0).password,
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
	$("#password").val(values.password);
	$("#notes").val(values.notes);
}

User.prototype.save = function()
{
	this.db.transaction(
	function(tx)
	{
			tx.executeSql("UPDATE userconfig set fname=?, lname=?, email=?, phone=?, fax=?, password=?, notes=? where id=?",
			[$("#fname").val(),$("#lname").val(),$("#email").val(),$("#phone").val(),$("#fax").val(),$("#password").val(),$("#notes").val(),formContext.id],
			function(){$('.ui-dialog').dialog('close')},
			null);
	});
}

