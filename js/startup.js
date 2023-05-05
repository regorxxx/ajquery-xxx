'use strict';﻿﻿﻿
//06/05/23

// Wait for document to load
document.addEventListener("DOMContentLoaded", function(e) {
	// Set theme colors
	if (Object.keys(xxx).length) {xxx.theme = ''; xxx.dynamicColor = true;}
	else {xxx = {}; xxx.theme = ''; xxx.dynamicColor = true;}
	$.getJSON('xxx/config-theme.json', function (data) {
		for (let setting of data) {xxx[setting.option] = setting.value;}
		if (xxx.theme && xxx.theme.length) {document.documentElement.setAttribute("data-theme", xxx.theme);}
	});
	// Set template version
	$('#help_btn').attr('title', 'Help (' + version + ')');
	$('#help_dlg').dialog('option', 'title', 'Help (' + version + ')');
});

// Stop server syncing while reloading
window.addEventListener("beforeunload", function(e) {
	bUnloading = true;
});