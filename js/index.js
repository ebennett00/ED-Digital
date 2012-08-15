var Redsky = Redsky || {};
Redsky.EDDigital = {};
Redsky.EDDigital.Events = {};
Redsky.EDDigital.Utils = {};
Redsky.EDDigital.Data = {};
Redsky.EDDigital.Data.Codefiles = {};


var dataContext,pagestate={};
var dbCurrentVersion = "0.3";

$(document).delegate("#page-splash","pageshow", function(){
	UpgradeDb(function(){
		$.mobile.changePage("#page-password");
	});
});
$(document).delegate("#page-user_config","pageinit", function(){
	dataContext = new Redsky.EDDigital.Data.User($('#user-config'));
});
$(document).delegate("#page-school_config","pageinit", function(){
	dataContext = new Redsky.EDDigital.Data.School($('#school-config'));
});
$(document).delegate("#page-codes_config","pageinit", function(){
	var db = new Redsky.EDDigital.Data.Database();
	db.transaction(function(tx){
		tx.executeSql("select * from lookupcodetables order by description;",[],function(tx,results){
			var list = $('#codetablelist');
			for(i=0;i<results.rows.length;i++)
			{
				list.append('<li><a href="codes.html?id='+results.rows.item(i).id+'&title='+encodeURIComponent(results.rows.item(i).description)+'">'+results.rows.item(i).description+'</a>'+'</li>');
			}
			list.listview('refresh');
		});
	});

});
$(document).delegate("#page-codes_detail","pageshow", function(){
	var getdata = Redsky.EDDigital.ParseQueryString(),
	codetableid = getdata['id'],
	codetablename = getdata['title'];
	$('#add_code_link').attr('href','code_edit.html?tid='+codetableid);
	$('#code_detail_header h1').text(codetablename);
	var db = new Redsky.EDDigital.Data.Database();
	db.transaction(function(tx){
		tx.executeSql("select * from lookupcodes where codeTable = ? order by description;",[codetableid],function(tx,results){
			var list = $('#codelist');
			list.empty();
			for(i=0;i<results.rows.length;i++)
			{
				list.append('<li><a href="code_edit.html?cid='+results.rows.item(i).id+'" data-rel="dialog">'+results.rows.item(i).description+'</a><a href="code_delete.html?id='+ results.rows.item(i).id +'&desc='+ encodeURIComponent(results.rows.item(i).description) +'" data-rel="dialog">Delete</a></li>');
			}
			list.listview('refresh');
		});
	});
});
$(document).delegate("#page-codes_detail_delete","pageinit", function(){
	var search = $('#page-codes_detail_delete').attr('data-url').split('?')[1];
	var getdata = Redsky.EDDigital.ParseQueryString(search);
	var codeid = getdata['id'];
	var codedesc = decodeURIComponent(getdata['desc']);
	$('#code_delete_id').val(codeid);
	$('#delete_confirm_value').text(codedesc);
	Redsky.EDDigital.Data.Codefiles.GetCodeUsage(codeid);
	
});
$(document).delegate("#page-codes_detail_edit","pageinit", function(){
	var search = $("#page-codes_detail_edit").attr('data-url').split('?')[1];
	var getdata = Redsky.EDDigital.ParseQueryString(search);
	var codeid = getdata['cid'];
	var codetableid = getdata['tid'];
	dataContext = new Redsky.EDDigital.Data.Code(codeid, codetableid, function(){
			$('#code_description').val(dataContext.data.description);
	});
});
$(document).delegate("#page-walkthrough_list","pageinit", function(){
	pagestate.wid="";
	$('#sort_name').click(function(){
		Redsky.EDDigital.Utils.SortUL('walkthrough_list','data-title',true);
	});
	$('#sort_date').click(function(){
		Redsky.EDDigital.Utils.SortUL('walkthrough_list','data-date',true);
	});
	var db = new Redsky.EDDigital.Data.Database();
	db.transaction(function(tx){
		tx.executeSql('select * from walkthrough order by dt desc;',[],function(tx,results){
			var list = $('#walkthrough_list');
			if(results.rows.length==0)
				list.after("<div>No saved walkthroughs</div>");
			for(i=0;i<results.rows.length;i++)
			{
				list.append('<li data-title="'+results.rows.item(i).title+'" data-date="'+results.rows.item(i).dt+'"><a href="walkthrough.html?id='+results.rows.item(i).id+'&title='+encodeURIComponent(results.rows.item(i).title)+'">'+results.rows.item(i).title+' ('+results.rows.item(i).dt+')</li>');
			}
			list.listview('refresh');
		},
		function(tx,err)
		{
			alert(err.message);
		});
	});

});
$(document).delegate("#page-walkthrough","pageinit", function(){
	var walkthroughid = pagestate.wid;
	if(!walkthroughid){
		var search = $('#page-walkthrough').attr('data-url').split('?')[1];
		var getdata = Redsky.EDDigital.ParseQueryString(search),
		walkthroughid = getdata['id'];
		pagestate.wid = walkthroughid;
	}
	dataContext = new Redsky.EDDigital.Data.Walkthrough(walkthroughid,function(){
		$('#walkthrough_header h1').text(dataContext.data.title + ' (' +dataContext.data.dt + ')');
		$('#walkthrough_notes').text(dataContext.data.notes);
		var list = $('#observation_list');
		if(dataContext.data.observations.length==0)
			list.after("<div>No saved observations</div>");
		for(var i=0;i<dataContext.data.observations.length;i++)
			list.append('<li><a href="observation.html?wid='+dataContext.data.id+'&oid='+dataContext.data.observations[i].id+'" data-rel="dialog">'+dataContext.data.observations[i].teacher+'</a></li>');
		list.listview('refresh');
	});
	
});
$(document).delegate("#page-observation","pageinit", function(){
	$('#time').scroller({
        preset: 'time',
        theme: 'default',
        display: 'modal',
        mode: 'scroller'
    });  
	Redsky.EDDigital.Data.Codefiles.BuildOptionList(1,function(options){
		$('#teacher').append(options).selectmenu('refresh');
	});
	Redsky.EDDigital.Data.Codefiles.BuildOptionList(3,function(options){
		$('#class').append(options).selectmenu('refresh');
	});
	Redsky.EDDigital.Data.Codefiles.BuildOptionList(6,function(options){
		$('#tasks').append(options).selectmenu('refresh');
	});
	Redsky.EDDigital.Data.Codefiles.BuildOptionList(7,function(options){
		$('#organizations').append(options).selectmenu('refresh');
	});
	Redsky.EDDigital.Data.Codefiles.BuildOptionList(8,function(options){
		$('#strategies').append(options).selectmenu('refresh');
	});
	Redsky.EDDigital.Data.Codefiles.BuildOptionList(9,function(options){
		$('#engagement').append(options).selectmenu('refresh');
	});
	var search = $('#page-observation').attr('data-url').split('?')[1];
	var getdata = Redsky.EDDigital.ParseQueryString(search),
	walkthroughid = getdata['wid'],
	observationid = getdata['oid'];
	dataContext = new Redsky.EDDigital.Data.Observation(walkthroughid,observationid,function(){
		var form = $('#observation');
		form.find('#teacher').val(dataContext.data.teacher).selectmenu('refresh');
		form.find('#class').val(dataContext.data.class).selectmenu('refresh');
		form.find('#time').val(dataContext.data.time);
		form.find('#tasks').val(Redsky.EDDigital.Utils.Split(dataContext.data.tasks)).selectmenu('refresh');
		form.find('#organizations').val(Redsky.EDDigital.Utils.Split(dataContext.data.organizations)).selectmenu('refresh');
		form.find('#strategies').val(Redsky.EDDigital.Utils.Split(dataContext.data.strategies)).selectmenu('refresh');
		form.find('#engagement').val(dataContext.data.engagement).selectmenu('refresh');
		form.find('#notes').val(dataContext.data.notes);
	});
});
$(document).delegate("#page-walkthrough_properties","pageinit", function(){
	$('#date').scroller({
        preset: 'date',
        theme: 'default',
        display: 'modal',
        mode: 'scroller'
    });  

	var search = $('#page-walkthrough_properties').attr('data-url').split('?')[1];
	var getdata = Redsky.EDDigital.ParseQueryString(search),
	walkthroughid = getdata['id'];

	dataContext = new Redsky.EDDigital.Data.Walkthrough(walkthroughid,function(){
		var form = $('#walkthrough_properties');
		form.find('#title').val(dataContext.data.title);
		form.find('#date').val(dataContext.data.dt);
		form.find('#notes').val(dataContext.data.notes);
	});
});


Redsky.EDDigital.Events.Walkthrough_save = function(){
	dataContext.save(function(){
		pagestate.wid=dataContext.data.id;
		$.mobile.changePage('observation.html?wid='+dataContext.data.id,{transition:'pop',role:'dialog'});
	});
	return false;
}
Redsky.EDDigital.Events.Walkthrough_openProperties = function(){
	dataContext.save(function(){
		pagestate.wid=dataContext.data.id;
		$.mobile.changePage('properties.html?id='+dataContext.data.id,{transition:'pop',role:'dialog'});
	});
	return false;
}
Redsky.EDDigital.Events.Observation_save = function(){
	var form = $('#observation');
	dataContext.data.teacher = form.find('#teacher').val();	
	dataContext.data.class = form.find('#class').val();
	dataContext.data.time = form.find('#time').val();
	dataContext.data.tasks = form.find('#tasks').val();
	dataContext.data.organizations = form.find('#organizations').val();
	dataContext.data.strategies = form.find('#strategies').val();
	dataContext.data.engagement = form.find('#engagement').val();
	dataContext.data.notes = form.find('#notes').val();
	dataContext.save(function(){
		Redsky.EDDigital.Events.CloseDialog();
		//$.mobile.changePage('walkthrough.html?id='+dataContext.data.walkthrough_id);
	});
	return false;
}
Redsky.EDDigital.Events.Code_save = function(){
	dataContext.data.description = $('#code_description').val();
	dataContext.save(function(){
		Redsky.EDDigital.Events.CloseDialog();
	});
}
Redsky.EDDigital.Events.Code_delete = function(){
	Redsky.EDDigital.Data.Codefiles.DeleteCode($('#code_delete_id').val(),function(){
	Redsky.EDDigital.Events.CloseDialog();
	});
}
Redsky.EDDigital.Events.CloseDialog = function(){
	$('.ui-dialog').dialog('close');
}
Redsky.EDDigital.Events.WalkthroughProperties_save = function(){
	var form = $('#walkthrough_properties');
	dataContext.data.title = form.find('#title').val();
	dataContext.data.dt = Redsky.EDDigital.Utils.Date(form.find('#date').val());
	dataContext.data.notes = form.find('#notes').val();
	dataContext.save(function(){
		Redsky.EDDigital.Events.CloseDialog();
		//$.mobile.changePage('walkthrough.html?id='+dataContext.data.id);
	});
	return false;
}


Redsky.EDDigital.ParseQueryString = function(instring){
	var datapairs,
	outdata = {},
	currentPair;
	
	if(instring == null)
		datapairs = window.location.search.substring(1).split('&');
	else
		datapairs = instring.split('&');
	for(var i in datapairs)
	{
		currentpair = datapairs[i].split('=');
		outdata[decodeURIComponent(currentpair[0])] = decodeURIComponent(currentpair[1]);
	}
	return outdata;
}
Redsky.EDDigital.Data.Codefiles.DeleteCode = function(codeId,callback){
	var db = new Redsky.EDDigital.Data.Database();
		db.transaction(function(tx){
		tx.executeSql("delete from lookupcodes where id = ?;",[codeId],
		callback(),
		null);
	});
}
Redsky.EDDigital.Data.Codefiles.BuildOptionList = function(codeTableId, callback){
	var db = new Redsky.EDDigital.Data.Database();
	db.transaction(function(tx){
		tx.executeSql("select * from lookupcodes where codeTable = ?;",[codeTableId],
		function(tx, results){
			var output = "";
			for(var i=0;i<results.rows.length;i++)
			{
				output += '<option value="'+ results.rows.item(i).id +'">'+ results.rows.item(i).description +'</option>';
			}
			callback(output);
		});
	});
}
Redsky.EDDigital.Utils.GetUsername = function(callback){
	Redsky.EDDigital.Utils.ExecuteScalar("select * from userconfig where id = ?",[1], function(resultrow){
		if(resultrow.fname && resultrow.lname)
			callback(resultrow.fname.substring(0,1)+resultrow.lname);
		else
			callback('Anonymous');
	});
}
Redsky.EDDigital.Utils.ExecuteScalar = function(SQL, params, callback){
	var db = new Redsky.EDDigital.Data.Database();
	db.transaction(function(tx)
		{
			tx.executeSql(SQL,params,
			function(tx, results){
				callback(results.rows.item(0));
			});
		});
}
Redsky.EDDigital.Utils.ExecuteInsert = function(SQL, params, callback){
	var db = new Redsky.EDDigital.Data.Database();
	db.transaction(function(tx)
		{
			tx.executeSql(SQL,params,
			function(tx, results){
				callback(results.insertId);
			},
			function(tx, err){
			alert(err.message);
			});
		});
}
Redsky.EDDigital.Utils.ExecuteUpdate = function(SQL, params, callback){
	var db = new Redsky.EDDigital.Data.Database();
	db.transaction(function(tx)
		{
			tx.executeSql(SQL,params,
			callback,
			function(tx, err){
			alert(err.message);
			});
		});
}
Redsky.EDDigital.Utils.Date = function(d){
	if(d)
		var d = new Date(d);
	else
		var d = new Date();
	return d.getFullYear()+"-"+
	Redsky.EDDigital.Utils.Pad(d.getMonth()+1,2,'0',true)+"-"+
	Redsky.EDDigital.Utils.Pad(d.getDate(),2,'0',true);
}
Redsky.EDDigital.Utils.Pad = function(value,length,padchar,left){
	value = value + ""
	while(value.length<length)
		value = left?padchar+value:value+padchar;
	return value;
}
Redsky.EDDigital.Utils.Split = function(instring){
	if(instring && instring.split)
		return(instring.split(','));
	else
		return([]);
}
Redsky.EDDigital.Utils.Join = function(inarray){
	if(inarray && inarray.join)
		return(inarray.join());
	else
		return('');
}
Redsky.EDDigital.Utils.SortUL = function(ulId,sortAttr, ascending){
		$('#'+ulId+' li').sort(sort_asc).appendTo('#'+ulId);
		
		function sort_asc(a,b){
			var bval = $(b).attr(sortAttr).toUpperCase();
			var aval = $(a).attr(sortAttr).toUpperCase();
			return bval<aval?1:-1; 
		}
}
Redsky.EDDigital.Data.Codefiles.GetCodeUsage = function(codeId, callback){
	var db = new Redsky.EDDigital.Data.Database();
	db.transaction(function(tx){
			tx.executeSql("SELECT codeTable from lookupcodes where id = ?",[codeId],
				function(tx,results){
					var tableID = results.rows.item(0).codeTable,
					location = {},
					SQL;
					
					switch(tableID){
					case 1:
						SQL = "select a.title as walkthrough_name, b.description as teacher_name from (walkthrough as a left outer join (observation as b inner join lookupcodes as c on c.id = b.teacher) on a.observation = b.id) where b.teacher = ?;" 
						break;
					case 3:
						SQL = "select a.title as walkthrough_name, b.description as teacher_name from (walkthrough as a left outer join (observation as b left outer join lookupcodes as c on c.id = b.teacher) on a.observation = b.id) where b.class = ?;" 
						break;
					case 6:
						SQL = "select a.title as walkthrough_name, b.description as teacher_name from (walkthrough as a left outer join ((observation as b inner join observation_task as d on b.id = d.observation_id) left outer join lookupcodes as c on c.id = b.teacher) on a.observation = b.id) where d.task_id = ?;" 
						break;
					case 7:
						SQL = "select a.title as walkthrough_name, b.description as teacher_name from (walkthrough as a left outer join ((observation as b inner join observation_organization as d on b.id = d.observation_id) left outer join lookupcodes as c on c.id = b.teacher) on a.observation = b.id) where d.organization_id = ?;" 
						break;
					case 8:
						SQL = "select a.title as walkthrough_name, b.description as teacher_name from (walkthrough as a left outer join ((observation as b inner join observation_strategy as d on b.id = d.observation_id) left outer join lookupcodes as c on c.id = b.teacher) on a.observation = b.id) where d.strategy_id = ?;" 
						break;
					case 9:
						SQL = "select a.title as walkthrough_name, b.description as teacher_name from (walkthrough as a left outer join (observation as b left outer join lookupcodes as c on c.id = b.teacher) on a.observation = b.id) where b.engagment = ?;" 
						break;
					}
					
					alert(SQL);
				},
			null);
			
	});
}
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
 
    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };
 
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
 
    return fBound;
  };
}

function PasswordCheck(lookupval){
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
function UpgradeDb(callback){
	var status = $("#status");
	//check for db support
	if(!window.openDatabase)
	{
		status.html("Your browser does not support <a href='http://en.wikipedia.org/wiki/Web_SQL_Database' target='_blank'>WebSQL</a>.");
		return;
	}
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
			var lookupCodeTables = [[1,"Teacher"],[2,"School Year"],[3,"Class"],[4,"Grade Level"],[5,"Class Period"],[6,"Student Task"],[7,"Organization"],[8,"Strategy"],[9,"Engagement"]];
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
			tx.executeSql("CREATE TABLE walkthrough (id integer primary key autoincrement, title text, dt text, notes text);");
			tx.executeSql("CREATE TABLE observation (id integer primary key autoincrement, walkthrough_id integer, teacher integer, class integer, time text, tasks text, organizations text, strategies text, engagement integer, notes text);");
			callback();
		},
		function(err){
		alert(err.message);
		});
	}
	else
	{
		status.html("Hmm, looks like you're running an old version of the development database. Clear your browser's app cache and try again. (We'll perform a db upgrade when moving between live versions.)");
	}
}
Redsky.EDDigital.Data.Database = function(){
	this.db = null;
	try
	{
		this.db = window.openDatabase("ED", dbCurrentVersion, "Educational Directions", 200000);
	}
	catch(e)
	{
		alert("The following error was received while processing the request: "+e.message);
	}
	return(this.db);
}

/*Object: Redsky.EDDigital.Data.User 
/ Purpose: stores and retrieves user data from web db. currently,
/          designed to support single user system
*/
Redsky.EDDigital.Data.User = function(form){
	this.id = 1;
	this.db = null;
	this.data = null;
	this.form = form;
	this.init();
};
Redsky.EDDigital.Data.User.prototype.init = function(){
	this.db = Redsky.EDDigital.Data.Database();
	if(this.form) this.form.bind('selectComplete', this.setFields);
	this.select();
}
Redsky.EDDigital.Data.User.prototype.select = function(){
	this.db.transaction(
		function(tx)
		{
			tx.executeSql("SELECT * FROM userconfig where id = ?",[this.id], 
			function(tx, results)
			{
				this.data={
					"fname":results.rows.item(0).fname,
					"lname":results.rows.item(0).lname,
					"email":results.rows.item(0).email,
					"phone":results.rows.item(0).phone,
					"fax":results.rows.item(0).fax,
					"password":results.rows.item(0).password,
					"notes":results.rows.item(0).notes
					};
					this.form.trigger('selectComplete', this);
			}.bind(this));
		}.bind(this));
}
Redsky.EDDigital.Data.User.prototype.setFields = function(event, ctx){
	ctx.form.find("#fname").val(ctx.data.fname);
	ctx.form.find("#lname").val(ctx.data.lname);
	ctx.form.find("#email").val(ctx.data.email);
	ctx.form.find("#phone").val(ctx.data.phone);
	ctx.form.find("#fax").val(ctx.data.fax);
	ctx.form.find("#hashedpassword").val(ctx.data.password);
	ctx.form.find("#notes").val(ctx.data.notes);
}
Redsky.EDDigital.Data.User.prototype.save = function(){
	this.db.transaction(
	function(tx){
			var password = $("#password").val()==""?$("#hashedpassword").val():CryptoJS.MD5($("#password").val());
			tx.executeSql("UPDATE userconfig set fname=?, lname=?, email=?, phone=?, fax=?, password=?, notes=? where id=?",
			[$("#fname").val(),$("#lname").val(),$("#email").val(),$("#phone").val(),$("#fax").val(),password,$("#notes").val(),dataContext.id],
			function(){Redsky.EDDigital.Events.CloseDialog();},
			null);
	});
}

/*Object: Redsky.EDDigital.Data.School 
/ Purpose: stores and retrieves user data from web db. currently,
/          designed to support single user system
*/
Redsky.EDDigital.Data.School = function (form){
	this.id = 1;
	this.db = null;
	this.data = null;
	this.form = form;
	this.init();
};
Redsky.EDDigital.Data.School.prototype.init = function(){
	this.db = Redsky.EDDigital.Data.Database();
	if(this.form) this.form.bind('selectComplete', this.setFields);
	this.select();
}
Redsky.EDDigital.Data.School.prototype.select = function(){
	this.db.transaction(
		function(tx)
		{
			tx.executeSql("SELECT * FROM schoolconfig where id = ?",[this.id], 
			function(tx, results)
			{
				this.data={
					"name":results.rows.item(0).name,
					"principal":results.rows.item(0).principal,
					"address":results.rows.item(0).address,
					"city":results.rows.item(0).city,
					"state":results.rows.item(0).state,
					"zip":results.rows.item(0).zip,
					"year":results.rows.item(0).year,
					"notes":results.rows.item(0).notes
					};
					this.form.trigger('selectComplete', this);
			}.bind(this));
		}.bind(this));
}
Redsky.EDDigital.Data.School.prototype.setFields = function(event, ctx){
	ctx.form.find("#name").val(ctx.data.name);
	ctx.form.find("#principal").val(ctx.data.principal);
	ctx.form.find("#address").val(ctx.data.address);
	ctx.form.find("#city").val(ctx.data.city);
	ctx.form.find("#state").val(ctx.data.state).selectmenu('refresh',true);
	ctx.form.find("#zip").val(ctx.data.zip);
	ctx.form.find("#year").val(ctx.data.year);
	ctx.form.find("#notes").val(ctx.data.notes);
}
Redsky.EDDigital.Data.School.prototype.save = function(){
	this.db.transaction(
	function(tx){
			tx.executeSql("UPDATE schoolconfig set name=?, principal=?, address=?, city=?, state=?, zip=?, year=?, notes=? where id=?",
			[$("#name").val(),$("#principal").val(),$("#address").val(),$("#city").val(),$("#state").val(),$("#zip").val(),$("#year").val(),$("#notes").val(),dataContext.id],
			function(){Redsky.EDDigital.Events.CloseDialog();},
			function(tx, err){debugger;});
	});
}

/*Object: Redsky.EDDigital.Data.Walkthrough
/ Purpose: stores and retrieves walkthrough data
*/
Redsky.EDDigital.Data.Walkthrough = function(id, callback){
	this.data = {'id':id};
	this.db = null;
	this.init(callback);
};
Redsky.EDDigital.Data.Walkthrough.prototype.init = function(callback){
	this.db = Redsky.EDDigital.Data.Database();
	if(!this.data.id)
	{
		this.data.dt = Redsky.EDDigital.Utils.Date();
		this.data.notes = '';
		Redsky.EDDigital.Utils.GetUsername(function(username){
			this.data.title = username;
			callback();
		}.bind(this));
		this.data.observations = [];
	}
	else
		this.select(callback);
}
Redsky.EDDigital.Data.Walkthrough.prototype.save = function(callback){
	if(this.data.id)
		this.update(callback)
	else
		this.insert(callback);
}
Redsky.EDDigital.Data.Walkthrough.prototype.insert = function(callback){
	Redsky.EDDigital.Utils.ExecuteInsert("insert into walkthrough (title, dt, notes) values (?,date(?),?);",
	[this.data.title, this.data.dt, this.data.notes],
	function(id){ 
		this.data.id = id; 
		callback(id);
	}.bind(this));
}
Redsky.EDDigital.Data.Walkthrough.prototype.select = function(callback){
		this.db.transaction(
		function(tx)
		{
			tx.executeSql("SELECT walkthrough.id as wid, title, dt, walkthrough.notes as wnotes, observation.id as oid, lookupcodes.description as teacher FROM (walkthrough left outer join observation on walkthrough.id = observation.walkthrough_id) left outer join lookupcodes on observation.teacher = lookupcodes.id where walkthrough.id = ?",[this.data.id], 
			function(tx, results)
			{
				this.data={
					"id":results.rows.item(0).wid,
					"title":results.rows.item(0).title,
					"dt":results.rows.item(0).dt,
					"notes":results.rows.item(0).wnotes
					};
				this.data.observations = [];
				for(var i=0;i<results.rows.length;i++)
					if(results.rows.item(i).oid)
						this.data.observations.push({
							"id":results.rows.item(i).oid,
							"teacher":results.rows.item(i).teacher
						});
					callback();
			}.bind(this),function(tx,err){
				alert(err.message);
			});
		}.bind(this));
}
Redsky.EDDigital.Data.Walkthrough.prototype.update = function(callback){
	Redsky.EDDigital.Utils.ExecuteUpdate("update walkthrough set title=?, dt=date(?), notes=? where id=?;",
	[this.data.title, this.data.dt, this.data.notes, this.data.id],
		callback);
}

/*Object: Redsky.EDDigital.Data.Observation
/ Purpose: stores and retrieves observation data
*/
Redsky.EDDigital.Data.Observation = function(walkthrough_id, observation_id, callback){
	this.data = {'walkthrough_id':walkthrough_id, 'observation_id':observation_id};
	this.db = null;
	this.init(callback);
};
Redsky.EDDigital.Data.Observation.prototype.init = function(callback){
	this.db = Redsky.EDDigital.Data.Database();
	if(!this.data.walkthrough_id || !this.data.observation_id)
		setTimeout(callback,100);
	else
		this.select(callback);
}
Redsky.EDDigital.Data.Observation.prototype.save = function(callback){
	if(this.data.id)
		this.update(callback)
	else
		this.insert(callback);
}
Redsky.EDDigital.Data.Observation.prototype.insert = function(callback){
	Redsky.EDDigital.Utils.ExecuteInsert("insert into observation (walkthrough_id, teacher, class, time, tasks, organizations, strategies, engagement, notes) values (?,?,?,?,?,?,?,?,?);",
	[ this.data.walkthrough_id, this.data.teacher, this.data.class, this.data.time, Redsky.EDDigital.Utils.Join(this.data.tasks), Redsky.EDDigital.Utils.Join(this.data.organizations), Redsky.EDDigital.Utils.Join(this.data.strategies), this.data.engagement, this.data.notes],
	function(id){ 
		this.data.observation_id = id;
		callback();
	}.bind(this));
}
Redsky.EDDigital.Data.Observation.prototype.select = function(callback){
		this.db.transaction(
		function(tx)
		{
			tx.executeSql("SELECT * from observation where id = ?",[this.data.observation_id], 
			function(tx, results)
			{
				this.data={
					"id":results.rows.item(0).id,
					"walkthrough_id":results.rows.item(0).walkthrough_id,
					"teacher":results.rows.item(0).teacher,
					"class":results.rows.item(0).class,
					"time":results.rows.item(0).time,
					"tasks":results.rows.item(0).tasks,
					"organizations":results.rows.item(0).organizations,
					"strategies":results.rows.item(0).strategies,
					"engagement":results.rows.item(0).engagement,
					"notes":results.rows.item(0).notes
					};
					callback();
			}.bind(this),function(tx,err){
				alert(err.message);
			});
		}.bind(this));
}
Redsky.EDDigital.Data.Observation.prototype.update = function(callback){
	Redsky.EDDigital.Utils.ExecuteUpdate("UPDATE observation set walkthrough_id=?, teacher=?, class=?, time=?, tasks=?, organizations=?, strategies=?, engagement=?, notes=? where id=?",
		[ this.data.walkthrough_id, this.data.teacher, this.data.class, this.data.time, Redsky.EDDigital.Utils.Join(this.data.tasks), Redsky.EDDigital.Utils.Join(this.data.organizations), Redsky.EDDigital.Utils.Join(this.data.strategies), this.data.engagement, this.data.notes, this.data.id],
		callback);
}

/*Object: Redsky.EDDigital.Data.Code
/ Purpose: stores and retrieves lookup code data
*/
Redsky.EDDigital.Data.Code = function(code_id, code_table_id, callback){
	this.data = {'id':code_id, 'codeTable':code_table_id};
	this.db = null;
	this.init(callback);
};
Redsky.EDDigital.Data.Code.prototype.init = function(callback){
	this.db = Redsky.EDDigital.Data.Database();
	if(!this.data.id)
		setTimeout(callback,100);
	else
		this.select(callback);
}
Redsky.EDDigital.Data.Code.prototype.save = function(callback){
	if(this.data.id)
		this.update(callback)
	else
		this.insert(callback);
}
Redsky.EDDigital.Data.Code.prototype.insert = function(callback){
	Redsky.EDDigital.Utils.ExecuteInsert("insert into lookupcodes (codeTable, description) values (?,?);",[this.data.codeTable, this.data.description],
	function(id){ 
		this.data.id = id;
		callback();
	}.bind(this));
}
Redsky.EDDigital.Data.Code.prototype.select = function(callback){
		this.db.transaction(
		function(tx)
		{
			tx.executeSql("SELECT * from lookupcodes where id = ?",[this.data.id], 
			function(tx, results)
			{
				this.data={
					"id":results.rows.item(0).id,
					"codeTable":results.rows.item(0).codeTable,
					"description":results.rows.item(0).description
					};
					callback();
			}.bind(this),function(tx,err){
				alert(err.message);
			});
		}.bind(this));
}
Redsky.EDDigital.Data.Code.prototype.update = function(callback){
	Redsky.EDDigital.Utils.ExecuteUpdate("UPDATE lookupcodes set codeTable=?, description=? where id=?;",
		[this.data.codeTable, this.data.description, this.data.id],
		callback);
}

