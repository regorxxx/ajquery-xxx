'use strict';
//11/06/24

// Wait for document to load
document.addEventListener("DOMContentLoaded", function (e) {
	// Set theme colors
	if (Object.keys(xxx).length) { xxx.theme = ''; xxx.dynamicColor = true; }
	else { xxx = {}; xxx.theme = ''; xxx.dynamicColor = true; }
	$.getJSON('xxx/config-theme.json', function (data) {
		for (let setting of data) { xxx[setting.option] = setting.value; }
		if (xxx.theme && xxx.theme.length) { document.documentElement.setAttribute("data-theme", xxx.theme); }
	});

	// Set template, foobar2000 and foo_httpcontrolversion
	let fbVer = 'foobar2000 v?.?';
	let fooHttpVer = 'http control v?.?';
	const updateUI = () => {
		console.log('Current version: ajquery-xxx ' + version + ' - ' + fbVer + ' - foo_httpcontrol ' + fooHttpVer);
		$('#help_btn').attr('title', 'Help (' + version + ')');
		$('#help_dlg').dialog('option', 'title', 'Help (' + version + ') [' + fbVer + ' - foo_httpcontrol ' + fooHttpVer + ']');
	};
	Promise.allSettled([
		$.get('/ajquery-xxx/?cmd=FoobarVersion'),
		$.get('/ajquery-xxx/?cmd=Version&param1=true')
	]).then((results) => {
		if (results[0].status === 'fulfilled' && results[0].value.indexOf('Invalid request') === -1) {
			fbVer = results[0].value;
		}
		if (results[1].status === 'fulfilled' && results[1].value.indexOf('Invalid request') === -1) {
			try { fooHttpVer = JSON.parse(results[1].value).versionName; } catch (e) { }
		}
	}).finally(updateUI);

});

// Stop server syncing while reloading
window.addEventListener("beforeunload", function (e) {
	bUnloading = true;
});