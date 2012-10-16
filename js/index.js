//set some global jquerymobile options
$(document).bind("mobileinit", function(){
	$.mobile.page.prototype.options.addBackBtn = true;
	$.mobile.defaultPageTransition='slide';
});

var Redsky = Redsky || {};
Redsky.EDDigital = {};
Redsky.EDDigital.Literals = {};
Redsky.EDDigital.Events = {};
Redsky.EDDigital.Utils = {};
Redsky.EDDigital.Data = {};
Redsky.EDDigital.Data.Codefiles = {};
Redsky.EDDigital.Report = {};

var dataContext,pagestate={};
var dbCurrentVersion = "0.4";

Redsky.EDDigital.Literals.RTFLineBreak = " \\par ";
Redsky.EDDigital.Literals.OutputTimeFormat = "H:mm tt";

$(document).delegate("#page-splash","pageshow", function(){
	Redsky.EDDigital.Data.UpgradeDb(function(){
		$.mobile.changePage("#page-password");
	});
});
$(document).delegate("#page-user_config","pagebeforeshow", function(){
	dataContext = new Redsky.EDDigital.Data.User(function(){
		var form = $('#user-config');
		form.find("#usr_fname").val(dataContext.data.fname);
		form.find("#usr_lname").val(dataContext.data.lname);
		form.find("#usr_email").val(dataContext.data.email);
		form.find("#usr_phone").val(dataContext.data.phone);
		form.find("#usr_fax").val(dataContext.data.fax);
		form.find("#usr_hashedpassword").val(dataContext.data.password);
		form.find("#usr_notes").val(dataContext.data.notes);
	});
});
$(document).delegate("#page-school_config","pagebeforeshow", function(){
	dataContext = new Redsky.EDDigital.Data.School(function(){
	var form = $('#school-config');
	form.find("#sch_name").val(dataContext.data.name);
	form.find("#sch_principal").val(dataContext.data.principal);
	form.find("#sch_address").val(dataContext.data.address);
	form.find("#sch_city").val(dataContext.data.city);
	form.find("#sch_state").val(dataContext.data.state).selectmenu('refresh',true);
	form.find("#sch_zip").val(dataContext.data.zip);
	form.find("#sch_year").val(dataContext.data.year);
	form.find("#sch_notes").val(dataContext.data.notes);
	});
});
$(document).delegate("#page-codes_config","pagebeforeshow", function(){
	var db = new Redsky.EDDigital.Data.Database();
	db.transaction(function(tx){
		tx.executeSql("select * from lookupcodetables order by description;",[],function(tx,results){
			var list = $('#codetablelist');
			list.empty();
			for(i=0;i<results.rows.length;i++)
			{
				list.append('<li><a href="#page-codes_detail?id='+results.rows.item(i).id+'&title='+encodeURIComponent(results.rows.item(i).description)+'">'+results.rows.item(i).description+'</a>'+'</li>');
			}
			list.listview('refresh');
		});
	});

});
$(document).delegate("#page-codes_detail","pagebeforeshow", function(){
	var getdata = Redsky.EDDigital.ParseQueryString(),
	codetableid = getdata['id'],
	codetablename = getdata['title'];
	$('#add_code_link').attr('href','#page-codes_detail_edit?tid='+codetableid);
	$('#code_detail_header h1').text(codetablename);
	var db = new Redsky.EDDigital.Data.Database();
	db.transaction(function(tx){
		tx.executeSql("select * from lookupcodes where codeTable = ? order by description;",[codetableid],function(tx,results){
			var list = $('#codelist');
			list.empty();
			for(i=0;i<results.rows.length;i++)
			{
				list.append('<li><a href="#page-codes_detail_edit?cid='+results.rows.item(i).id+'">'+results.rows.item(i).description+'</a><a href="#page-codes_detail_delete?id='+ results.rows.item(i).id +'&desc='+ encodeURIComponent(results.rows.item(i).description) +'" data-rel="dialog">Delete</a></li>');
			}
			list.listview('refresh');
		});
	});
});
$(document).delegate("#page-codes_detail_delete","pagebeforeshow", function(){
	var search = $('#page-codes_detail_delete').attr('data-url').split('?')[1];
	var getdata = Redsky.EDDigital.ParseQueryString(search);
	var codeid = getdata['id'];
	var codedesc = decodeURIComponent(getdata['desc']);
	$('#code_delete_id').val(codeid);
	$('#delete_confirm_value').text(codedesc);
	Redsky.EDDigital.Data.Codefiles.GetCodeUsage(codeid);
	
});
$(document).delegate("#page-codes_detail_edit","pagebeforeshow", function(){
	var search = $("#page-codes_detail_edit").attr('data-url').split('?')[1];
	var getdata = Redsky.EDDigital.ParseQueryString(search);
	var codeid = getdata['cid'];
	var codetableid = getdata['tid'];
	dataContext = new Redsky.EDDigital.Data.Code(codeid, codetableid, function(){
			$('#code_description').val(dataContext.data.description);
	});
});
$(document).delegate("#page-walkthrough_list","pagebeforeshow", function(){
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
			list.empty();
			if(results.rows.length==0)
				list.append("<li>No saved walkthroughs</li>");
			for(i=0;i<results.rows.length;i++)
			{
				list.append('<li data-title="'+results.rows.item(i).title+'" data-date="'+results.rows.item(i).dt+'"><a href="#page-walkthrough?id='+results.rows.item(i).id+'&title='+encodeURIComponent(results.rows.item(i).title)+'">'+results.rows.item(i).title+' ('+results.rows.item(i).dt+')</li>');
			}
			list.listview('refresh');
		},
		function(tx,err)
		{
			alert(err.message);
		});
	});

});
$(document).delegate("#page-walkthrough","pagebeforeshow", function(){
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
		list.empty();
		if(dataContext.data.observations.length==0)
			list.append("<li>No saved observations</li>");
		for(var i=0;i<dataContext.data.observations.length;i++)
			list.append('<li><a href="#page-observation?wid='+dataContext.data.id+'&oid='+dataContext.data.observations[i].id+'">'+dataContext.data.observations[i].teacher+'</a></li>');
		list.listview('refresh');
	});
	
});
$(document).delegate("#page-observation","pagebeforeshow", function(){
	$('#obs_time').scroller({
        preset: 'time',
        theme: 'default',
        display: 'modal',
        mode: 'scroller'
    });  
	Redsky.EDDigital.Data.Codefiles.BuildOptionList(1,"Select one",function(options){
		$('#obs_teacher').empty().append(options).selectmenu('refresh');
	});
	Redsky.EDDigital.Data.Codefiles.BuildOptionList(3,"Select one",function(options){
		$('#obs_class').empty().append(options).selectmenu('refresh');
	});
	Redsky.EDDigital.Data.Codefiles.BuildOptionList(6,"Select one or more",function(options){
		$('#obs_tasks').empty().append(options).selectmenu('refresh');
	});
	Redsky.EDDigital.Data.Codefiles.BuildOptionList(7,"Select one or more",function(options){
		$('#obs_organizations').empty().append(options).selectmenu('refresh');
	});
	Redsky.EDDigital.Data.Codefiles.BuildOptionList(8,"Select one or more",function(options){
		$('#obs_strategies').empty().append(options).selectmenu('refresh');
	});
	Redsky.EDDigital.Data.Codefiles.BuildOptionList(9,"Select one",function(options){
		$('#obs_engagement').empty().append(options).selectmenu('refresh');
	});
	var search = $('#page-observation').attr('data-url').split('?')[1];
	var getdata = Redsky.EDDigital.ParseQueryString(search),
	walkthroughid = getdata['wid'],
	observationid = getdata['oid'];
	dataContext = new Redsky.EDDigital.Data.Observation(walkthroughid,observationid,function(){
		var form = $('#observation');
		form.find('#obs_teacher').val(dataContext.data.teacher).selectmenu('refresh');
		form.find('#obs_class').val(dataContext.data.class).selectmenu('refresh');
		form.find('#obs_time').val(dataContext.data.time?Date.parse(dataContext.data.time).toString(Redsky.EDDigital.Literals.OutputTimeFormat):'');
		form.find('#obs_tasks').val(Redsky.EDDigital.Utils.Split(dataContext.data.tasks)).selectmenu('refresh');
		form.find('#obs_organizations').val(Redsky.EDDigital.Utils.Split(dataContext.data.organizations)).selectmenu('refresh');
		form.find('#obs_strategies').val(Redsky.EDDigital.Utils.Split(dataContext.data.strategies)).selectmenu('refresh');
		form.find('#obs_engagement').val(dataContext.data.engagement).selectmenu('refresh');
		form.find('#obs_notes').val(dataContext.data.notes);
	});
});
$(document).delegate("#page-walkthrough_properties","pagebeforeshow", function(){
	$('#wlkt_date').scroller({
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
		form.find('#wlkt_title').val(dataContext.data.title);
		form.find('#wlkt_date').val(dataContext.data.dt);
		form.find('#wlkt_notes').val(dataContext.data.notes);
	});
});
$(document).delegate("#page-savereport","pagebeforeshow", function(){
	var search = $('#page-savereport').attr('data-url').split('?')[1];
	var getdata = Redsky.EDDigital.ParseQueryString(search);
	var reporttype = getdata['id']
	$('#reportType').val(reporttype);
	switch(reporttype)
	{
		case "full":
		case "ind":
			$('#reportextension').html(".rtf");
			break;
		case "csv":
			$('#reportextension').html(".csv");
			break;
	}
	$('#SaveReportBegin').show();
	$('#SaveReportFinished').hide();
});

Redsky.EDDigital.Events.Login_click = function(){
	Redsky.EDDigital.Utils.PasswordCheck($('#password').val(),
		function(){document.location.href = "#page-main_menu"},
		function(msg){
			$('#loginMessage').html(msg);
			$('#password').val('');
		});
}
Redsky.EDDigital.Events.School_save = function(){
		var form = $('#school-config');
		dataContext.data.name = form.find("#sch_name").val();
		dataContext.data.principal = form.find("#sch_principal").val();
		dataContext.data.address = form.find("#sch_address").val();
		dataContext.data.city = form.find("#sch_city").val();
		dataContext.data.state = form.find("#sch_state").val();
		dataContext.data.zip = form.find("#sch_zip").val();
		dataContext.data.year = form.find("#sch_year").val();
		dataContext.data.notes = form.find("#sch_notes").val();
		
		dataContext.save(function(){
			history.back();
		});
}
Redsky.EDDigital.Events.User_save = function(){
		var form = $('#user-config');
		var password = $("#usr_password").val()==""?$("#usr_hashedpassword").val():CryptoJS.MD5($("#usr_password").val());
		dataContext.data.fname = form.find("#usr_fname").val();		
		dataContext.data.lname = form.find("#usr_lname").val();
		dataContext.data.email = form.find("#usr_email").val();
		dataContext.data.phone = form.find("#usr_phone").val();
		dataContext.data.fax = form.find("#usr_fax").val();
		dataContext.data.password = password;
		dataContext.data.notes = form.find("#usr_notes").val();
		
		dataContext.save(function(){
			history.back();
		});
}
Redsky.EDDigital.Events.Walkthrough_newObservation = function(){
	dataContext.save(function(){
		pagestate.wid=dataContext.data.id;
		$.mobile.changePage('#page-observation?wid='+dataContext.data.id);
	});
}
Redsky.EDDigital.Events.Walkthrough_openProperties = function(){
	dataContext.save(function(){
		pagestate.wid=dataContext.data.id;
		$.mobile.changePage('#page-walkthrough_properties?id='+dataContext.data.id);
	});
	return false;
}
Redsky.EDDigital.Events.Observation_save = function(){
	var form = $('#observation');
	var temp;
	dataContext.data.teacher = form.find('#obs_teacher').val();	
	dataContext.data.class = form.find('#obs_class').val();
	temp = form.find('#obs_time').val();
	dataContext.data.time = temp?Date.parse(temp).toString('HH:mm:ss'):'';
	dataContext.data.tasks = form.find('#obs_tasks').val();
	dataContext.data.organizations = form.find('#obs_organizations').val();
	dataContext.data.strategies = form.find('#obs_strategies').val();
	dataContext.data.engagement = form.find('#obs_engagement').val();
	dataContext.data.notes = form.find('#obs_notes').val();
	dataContext.save(function(){
		history.back();
	});
	return false;
}
Redsky.EDDigital.Events.Code_save = function(){
	dataContext.data.description = $('#code_description').val();
	dataContext.save(function(){
		history.back();
	});
}
Redsky.EDDigital.Events.Code_delete = function(){
	Redsky.EDDigital.Data.Codefiles.DeleteCode($('#code_delete_id').val(),function(){
	$('.ui-dialog').dialog('close');
	});
}
Redsky.EDDigital.Events.WalkthroughProperties_save = function(){
	var form = $('#walkthrough_properties');
	dataContext.data.title = form.find('#wlkt_title').val();
	dataContext.data.dt = Redsky.EDDigital.Utils.Date(form.find('#wlkt_date').val());
	dataContext.data.notes = form.find('#wlkt_notes').val();
	dataContext.save(function(){
		history.back();
	});
	return false;
}
Redsky.EDDigital.Events.ReportRun_click = function(){
	$('#SaveReportBegin').hide('fast');
	$.mobile.loading('show',{text:'Generating Report', textVisible:true});
	Redsky.EDDigital.Report.GenerateReport($('#reportType').val(),{},$('#reportName').val(),function(result){
		$.mobile.loading('hide');
		$('#SaveReportResult').html(result);
		$('#SaveReportFinished').show('fast');
		});
}

Redsky.EDDigital.ParseQueryString = function(instring){
	var datapairs = [],
	outdata = {},
	currentPair;
	
	if(instring == null)
	{
		if(window.location.hash.indexOf('?')>=0)
			datapairs = window.location.hash.split('?')[1].split('&');
	}
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
Redsky.EDDigital.Data.Codefiles.BuildOptionList = function(codeTableId, promptOption, callback){
	var db = new Redsky.EDDigital.Data.Database();
	db.transaction(function(tx){
		tx.executeSql("select * from lookupcodes where codeTable = ?;",[codeTableId],
		function(tx, results){
			var output = "";
			if(promptOption)
				output += '<option value="">'+ promptOption +'</option>';
			for(var i=0;i<results.rows.length;i++)
			{
				output += '<option value="'+ results.rows.item(i).id +'">'+ results.rows.item(i).description +'</option>';
			}
			callback(output);
		});
	});
}
Redsky.EDDigital.Data.Codefiles.Translator = function(readycallback){
	this.lookupTable = [];
	var db = new Redsky.EDDigital.Data.Database();
	SQL = "select id, description from lookupcodes order by id;"
	db.transaction(function(tx){
		tx.executeSql(SQL,[],
		function(tx, results){
			for(var i=0;i<results.rows.length;i++)
				this.lookupTable[results.rows.item(i).id] = results.rows.item(i).description;
			readycallback();
		}.bind(this));
	}.bind(this));
}
Redsky.EDDigital.Data.Codefiles.Translator.prototype.Translate = function(codeIds){
	var ids = codeIds.split(",");
	var output = [];
	for(i=0;i<ids.length;i++)
		if(ids[i] in this.lookupTable)
			output.push(this.lookupTable[ids[i]]);
	return output;
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
					
					//alert(SQL);
				},
			null);
			
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
Redsky.EDDigital.Utils.PasswordCheck = function(lookupval,successcallback,failcallback){
	hashedPassword = CryptoJS.MD5(lookupval);
	db = window.openDatabase("ED", "", "Educational Directions", 200000);
	db.transaction(function(tx){
		tx.executeSql("SELECT count(id) as idcount from userconfig where password = ?",[hashedPassword], 
		function(tx,results){
			if(results.rows.item(0).idcount>0)
				successcallback();
			else
				failcallback("The password entered is incorrect")
		},
		function(err)
		{
			failcallback("An error occurred while logging in: "+ err.message);
		});
	});
	return(false);
}

Redsky.EDDigital.Data.UpgradeDb = function(callback){
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
			tx.executeSql("CREATE TABLE lookupcodetables (id integer primary key, is_scale integer, description text);");
			var lookupCodeTables = [[1,0,"Teacher"],[2,0,"School Year"],[3,0,"Class"],[4,0,"Grade Level"],[5,0,"Class Period"],[6,0,"Student Task"],[7,0,"Organization"],[8,0,"Strategy"],[9,1,"Engagement"]];
			for(i=0;i<lookupCodeTables.length;i++)
				tx.executeSql("INSERT INTO lookupcodetables values (?,?,?);",lookupCodeTables[i]);
			tx.executeSql("CREATE TABLE lookupcodes (id integer primary key autoincrement, codeTable integer, description text, scale_value integer, dflt integer);");
			var lookupCodes = [[2,"2010-2011",0,1],
							   [4,"K",0,0],[4,"1st",0,0],[4,"2nd",0,0],[4,"3rd",0,0],[4,"4th",0,0],[4,"5th",0,0],[4,"6th",0,0],[4,"7th",0,0],[4,"8th",0,0],[4,"9th",0,0],[4,"10th",0,0],[4,"11th",0,0],[4,"12th",0,0],[4,"Split",0,0],[4,"Other",0,0],
							   [5,"1",0,0],[5,"2",0,0],[5,"3",0,0],[5,"4",0,0],[5,"5",0,0],[5,"6",0,0],[5,"7",0,0],
							   [6,"Acquire",0,0],[6,"Practice",0,0],[6,"Translate",0,0],[6,"Create Meaning",0,0],[6,"Equivalent Use",0,0],[6,"Assessment",0,0],
							   [7,"Whole class lecture",0,0],[7,"Whole class demonstration",0,0],[7,"Whole class worksheet",0,0],[7,"Whole class reading/writing",0,0],[7,"Group work/discussion",0,0],[7,"Differentiated stations or groups",0,0],[7,"Individual research or problem solving ",0,0],
							   [8,"Differentiated instruction",0,0],[8,"Differentiated student work",0,0],[8,"Differentiated student product",0,0],[8,"Differentiated assessment",0,0],[8,"Adaptive technology",0,0],[8,"Compensating technology",0,0],[8,"Supportive visuals",0,0],[8,"None/Not Sure",0,0],
							   [9,"All highly engaged",4,0],[9,"Most engaged",3,0],[9,"Some engaged",2,0],[9,"Most off task",1,0],[9,"All off task",0,0]
							  ];
			for(i=0;i<lookupCodes.length;i++)
				tx.executeSql("INSERT INTO lookupcodes (codeTable, description, scale_value, dflt) values (?,?,?,?);",lookupCodes[i],null,null);
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
Redsky.EDDigital.Data.Database = function(errorcallback){
	this.db = null;
	try
	{
		this.db = window.openDatabase("ED", dbCurrentVersion, "Educational Directions", 200000);
	}
	catch(e)
	{
		errorcallback("The following error was received while processing the request: "+e.message);
	}
	return(this.db);
}

/*Object: Redsky.EDDigital.Data.User 
/ Purpose: stores and retrieves user data from web db. currently,
/          designed to support single user system
*/
Redsky.EDDigital.Data.User = function(callback){
	this.id = 1;
	this.db = null;
	this.data = null;
	this.init(callback);
};
Redsky.EDDigital.Data.User.prototype.init = function(callback){
	this.db = Redsky.EDDigital.Data.Database();
	this.select(callback);
}
Redsky.EDDigital.Data.User.prototype.select = function(callback){
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
					callback();
			}.bind(this));
		}.bind(this));
}
Redsky.EDDigital.Data.User.prototype.save = function(callback){
	var password = $("#usr_password").val()==""?$("#usr_hashedpassword").val():CryptoJS.MD5($("#usr_password").val());
	Redsky.EDDigital.Utils.ExecuteUpdate("UPDATE userconfig set fname=?, lname=?, email=?, phone=?, fax=?, password=?, notes=? where id=?",
		[this.data.fname,this.data.lname,this.data.email,this.data.phone,this.data.fax,this.data.password,this.data.notes,this.id],
		callback);
}

/*Object: Redsky.EDDigital.Data.School 
/ Purpose: stores and retrieves user data from web db. currently,
/          designed to support single user system
*/
Redsky.EDDigital.Data.School = function (callback){
	this.id = 1;
	this.db = null;
	this.data = null;
	this.init(callback);
};
Redsky.EDDigital.Data.School.prototype.init = function(callback){
	this.db = Redsky.EDDigital.Data.Database();
	this.select(callback);
}
Redsky.EDDigital.Data.School.prototype.select = function(callback){
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
					callback();
			}.bind(this));
		}.bind(this));
}
Redsky.EDDigital.Data.School.prototype.save = function(callback){
	Redsky.EDDigital.Utils.ExecuteUpdate("UPDATE schoolconfig set name=?, principal=?, address=?, city=?, state=?, zip=?, year=?, notes=? where id=?",
			[this.data.name,this.data.principal,this.data.address,this.data.city,this.data.state,this.data.zip,this.data.year,this.data.notes,this.id],
			callback);
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
		callback());
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
		setTimeout(callback,100);//give time for this new object to return before performing the callback
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
					"description":results.rows.item(0).description,
					"scale_value":results.rows.item(0).scale_value
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

/*Object: Redsky.EDDigital.Report
/ Purpose: enables data output to filesystem in a variety of formats
*/
Redsky.EDDigital.Report.FsWrite = function(filename, content, callback){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
	function(fileSystem){
		fileSystem.root.getFile(filename, {create: true},
		function(fileEntry){
			fileEntry.createWriter(
			function(writer){
				writer.onwrite = function(){callback("Report was successfully exported to the following location:<h3>" +fileEntry.fullPath+"</h3>");}
				writer.onerror = function(err){console.log(err);};
				writer.write(content);
			},
			fail);
		},
		fail);
	},
	fail);
}
Redsky.EDDigital.Report.GenerateReport = function(reportType, parameters, filename, callback){
	var merger = null;
	switch(reportType)
	{
		case "full":
			merger = new Redsky.EDDigital.Report.Merger(reportType,parameters,
				function(){
					console.log("All tokens returned... right?");
					$.ajax({url:'reports/templates/fullreport.txt'}).done(function(reportTemplate){
						$.ajax({url:'reports/templates/fullreport_r.txt'}).done(function(rowTemplate){
							merger.AddSubdocument("ObservationRows", rowTemplate);
							//calling merger.Merge from within the anon func alows the Merge function to use the correct context
							var output = reportTemplate.replace(/<-([\w]*)->/g,function(match,p1){return(merger.Merge(match,p1));}); 
							Redsky.EDDigital.Report.FsWrite(filename+".rtf",output, callback);
							});
						});
				},
				function(msg){console.log("Something has gone terribly wrong: "+msg);},
				function(msg){console.log("Making Progress: "+msg);});
			break;
		default:
			setTimeout(function(){callback("No report of type '"+ reportType +"' was found.");},1000);
	}
}
Redsky.EDDigital.Report.Merger = function(reporttype,parameters,readycallback,failedcallback,progresscallback){
	this.dataList = {"Today":Redsky.EDDigital.Utils.Date()};
	this.subdocuments = [];
	var db = Redsky.EDDigital.Data.Database();
	switch(reporttype)
	{
		case "full":
			//asynchronously launch all of our data collection for the report. use jquery deferreds to sync the returns
			var tokens = [];
			tokens[0] = new $.Deferred;
			tokens[1] = new $.Deferred;
			tokens[2] = new $.Deferred;
			tokens[3] = new $.Deferred;

			db.transaction(function(tx){
				tx.executeSql("select * from schoolconfig;",[],
					function(tx, results)
					{
						this.dataList.SchoolName = results.rows.item(0).name;
						this.dataList.SchoolAddress = results.rows.item(0).address;
						this.dataList.SchoolCity = results.rows.item(0).city;
						this.dataList.SchoolState = results.rows.item(0).state;
						this.dataList.SchoolZip = results.rows.item(0).zip;
						this.dataList.SchoolPrincipal = results.rows.item(0).principal;
						progresscallback("Done loading school info.");
						tokens[0].resolve();
					}.bind(this))
			}.bind(this));
			db.transaction(function(tx){
				tx.executeSql("select count(observation.id) as observation_count, lookupcodes.description as teacher from observation inner join lookupcodes on observation.teacher = lookupcodes.id group by teacher order by teacher;",[],
					function(tx, results)
					{
						var observationcount = 0;
						var teachernames = [];
						for(var i=0;i<results.rows.length;i++)
						{
							observationcount += results.rows.item(i).observation_count;
							teachernames.push(results.rows.item(i).teacher + " (" +results.rows.item(i).observation_count +")");
						}
						this.dataList.ObservationCount = observationcount;
						this.dataList.ObservationTeachers = teachernames.join(", ");
						progresscallback("Done loading summary info.");
						tokens[1].resolve();
					}.bind(this))
			}.bind(this));
			db.transaction(function(tx){
				tx.executeSql("select o.time, t.description as teacher, c.description as classname, o.tasks, o.organizations, o.strategies, e.description as engagement from observation as o left join lookupcodes as t on o.teacher = t.id left join lookupcodes as c on o.class = c.id	left join lookupcodes as e on o.engagement = e.id order by o.time;",[],
					function(tx, results)
					{
						this.dataList.ObservationRows = [];
						for(var i=0;i<results.rows.length;i++)
						{
							this.dataList.ObservationRows[i] = {};
							this.dataList.ObservationRows[i].TeacherClassTime = [results.rows.item(i).teacher, results.rows.item(i).classname, results.rows.item(i).time?Date.parse(results.rows.item(i).time).toString(Redsky.EDDigital.Literals.OutputTimeFormat):''].filter(function(e){return(e);}).join(Redsky.EDDigital.Literals.RTFLineBreak);
							this.dataList.ObservationRows[i].StudentTask = results.rows.item(i).tasks;
							this.dataList.ObservationRows[i].Organization = results.rows.item(i).organizations;
							this.dataList.ObservationRows[i].Strategy = results.rows.item(i).strategies;
							this.dataList.ObservationRows[i].Engagement = results.rows.item(i).engagement;
						}
						progresscallback("Done loading all observations.");
						tokens[2].resolve();
					}.bind(this))
			}.bind(this));
			var translator = new Redsky.EDDigital.Data.Codefiles.Translator(function(){
				progresscallback("Done loading translate table.");
				tokens[3].resolve();
				});
			
			//wait for the jquery deferreds to return before proceeding
			$.when.apply(null,tokens)
			.done(function(){
				for(var i=0;i<this.dataList.ObservationRows.length;i++)
				{
					this.dataList.ObservationRows[i].StudentTask = translator.Translate(this.dataList.ObservationRows[i].StudentTask).join(Redsky.EDDigital.Literals.RTFLineBreak);
					this.dataList.ObservationRows[i].Organization = translator.Translate(this.dataList.ObservationRows[i].Organization).join(Redsky.EDDigital.Literals.RTFLineBreak);
					this.dataList.ObservationRows[i].Strategy = translator.Translate(this.dataList.ObservationRows[i].Strategy).join(Redsky.EDDigital.Literals.RTFLineBreak);
				}
				readycallback()
			}.bind(this))
			.fail(function(){failedcallback("One or more data fetches failed.");});

			break;
		default:
			failedcallback("No report of type '"+ reportType +"' was found.");
	}
}
Redsky.EDDigital.Report.Merger.prototype.Merge = function(match,p1){
	if(p1 in this.subdocuments)
	{
		var subdocname = p1;
		var subdocresult = ""
		for(var i=0;i<this.dataList[p1].length;i++)
			subdocresult += this.subdocuments[subdocname].replace(/<-([\w]*)->/g,
			function(match,keyword){
				var result = keyword in this.dataList[subdocname][i]?this.dataList[subdocname][i][keyword]:'dammit';
				return(result);
			}.bind(this));
		return subdocresult;
	}
	else if(p1 in this.dataList)
		return(this.dataList[p1]);
	
	else
		return("");
}
Redsky.EDDigital.Report.Merger.prototype.AddSubdocument = function(subDocName, content){
	this.subdocuments[subDocName] = content;
}
function fail(error) {
	console.log(error.code);
}
	
	
