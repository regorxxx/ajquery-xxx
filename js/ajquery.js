'use strict';﻿﻿﻿
//05/03/23

let fb; // fb2k state
let smp;// SMP data
let xxx;// SMP data
let br; // file browser state
let brOffsets = {}; // directory scroll offsets
let library;
let aa = new Object; // albumart image
aa.altSize = false;
let windowsList = {}; // opened dialog windows list
let isWorking = false; // true while doing something network related
let settingTabs = false; // true when mangling with playlist tabs
let timeoutId, timeoutId2;
let npid;
let brParams = new Object;
let keyPressed = {};
let inputHasFocus = false;
const refreshInterval = 1000; // ms,.data retrieval interval, (not supposed to be changed)
const menusPls = [
	{id: 'PMME0',	type: '',					bSelection: false,	name: '', 						description: ''},
	{id: 'PMME1',	type:'load playlist',		bSelection: false,	name: 'Load playlist/', 		description: 'Load playlist into UI.'},
	{id: 'PMME2',	type:'lock playlist',		bSelection: false,	name: ['Lock playlist/','Unlock playlist/'],			description: 'Lock playlist file.'},
	{id: 'PMME3',	type:'delete playlist',		bSelection: false,	name: 'Delete playlist/', 		description: 'Delete playlist file.'},
	{id: 'PMME4',	type:'clone in ui',			bSelection: false,	name: 'Clone playlist in UI/',	description: 'Load a copy of the playlist file.'},
	{id: 'PMME5',	type:'send selection',		bSelection: true,	name: 'Send selection to/',		description: 'Send selection to playlist file.'},
	{id: 'PMME6',	type:'new playlist (empty)',bSelection: false,	name: 'New empty playlist/',	description: 'Create a new empty playlist file.'},
	{id: 'PMME7',	type:'new playlist (ap)',	bSelection: false,	name: 'New playlist (active)/',	description: 'Create new playlist file from active playlist.'},
	{id: 'PMME8',	type:'manual refresh',		bSelection: false,	name: '/Manual refresh',		description: 'Refresh the manager.'}
];

const log = {
	alt: false,
	maxLines: 10,
	maxLinesAlt: 20,
	reset: function() {this.alt = false;}
};

const mouse = {
	x: 0,
	y: 0,
	down: false,
	reset: function() {this.down = false;}
};

const drag = {
	start: null,
	end: null,
	dragging: false,
	timeout: null,
	pageShift: 0,
	reset: function() { this.dragging = false; this.pageShift = 0; clearTimeout(this.timeout); }
};

const selection = {
	items: {},
	count: 0,
	lowest: 0,
	highest: 0,
	length: 0,
	calc: function () {
		let count = 0;
		let lowest = fb ? fb.playlistItemsCount : 0;
		let highest = 0;
		let length = 0;

		$.each(this.items, function(k,v) {
			if (v) {
				k = parseInt(k);
				if (!isNaN(k)) {
					if (k < lowest) {lowest = k;}
					if (k > highest) {highest = k;}
					let pr = fb ? fb.playlist[k - (fb.playlistPage - 1) * fb.playlistItemsPerPage] : null;
					if (pr) {
						const len = parseInt(pr.ls);
						if (!isNaN(len)) {length += len;}
					}
					++count;
				}
			}
		});

		this.count = count;
		this.lowest = lowest;
		this.highest = highest;
		this.length = length;
	},
	toStr: function (s) {
		let shift = s || 0;
		let result = '';
		$.each(this.items, function(k,v) {
			if (v) {
				if (result) {result += ',';}
				result += (parseInt(k) + shift);
			}
		});
		return result;
	},
	reset: function () { this.items = {}; this.count = 0; },
	clone: function () {
		return {items: {...this.items}, count: this.count, lowest: this.lowest, highest: this.highest, length: this.length};;
	},
	restore: function ({items, count, lowest, highest, length}) {
		this.items = {...items};
		this.count = count;
		this.lowest = lowest;
		this.highest = highest;
		this.length = length;
	}
}

const tooltip = {
	show: function(text, l, t) {
		$('#tooltip').text(text);
		if (t && l) {$('#tooltip').css( { position: 'absolute', left: l, top: t } ).show();}
	},
	hide: function() {
		$('#tooltip').hide();
	}
}

jQuery.cookie = function(name, value, options) {
	/**
	* Cookie plugin
	*
	* Copyright (c) 2006 Klaus Hartl (stilbuero.de)
	* Dual licensed under the MIT and GPL licenses:
	* http://www.opensource.org/licenses/mit-license.php
	* http://www.gnu.org/licenses/gpl.html
	*
	*/
	if (typeof value != 'undefined') { // name and value given, set cookie
		options = options || {};
		if (value === null) {
			value = '';
			options.expires = -1;
		}
		let expires = '';
		if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
			let date;
			if (typeof options.expires == 'number') {
				date = new Date();
				date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
			} else {
				date = options.expires;
			}
			expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
		}
		// CAUTION: Needed to parenthesize options.path and options.domain
		// in the following expressions, otherwise they evaluate to undefined
		// in the packed version for some reason...
		const path = options.path ? '; path=' + (options.path) : '';
		const domain = options.domain ? '; domain=' + (options.domain) : '';
		const secure = options.secure ? '; secure' : '';
		document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
	} else { // only name given, get cookie
		let cookieValue = null;
		if (document.cookie && document.cookie != '') {
			let cookies = document.cookie.split(';');
			for (let i = 0; i < cookies.length; i++) {
				let cookie = jQuery.trim(cookies[i]);
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
};

function promptf(msg, value) {
	inputHasFocus = true;
	const result = prompt(msg, value);
	inputHasFocus = false;
	return result;
}

/* This script and many more are available free online at
The JavaScript Source!! http://javascript.internet.com
Created by: Justas | http://www.webtoolkit.info/ */
const Url = {
	// public method for URL encoding
	encode : function (string) {
		return escape(this._utf8_encode(string));
	},
	// public method for URL decoding
	decode : function (string) {
		return this._utf8_decode(unescape(string));
	},
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		if (!string) {return '';}
		string = string.replace(/\r\n/g,"\n");
		let utftext = "";
		for (let n = 0; n < string.length; n++) {
			const c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	},
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		if (!utftext) return '';
		let string = "";
		let i = 0;
		let c = 0, c1 = 0, c2 = 0;
		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
}

function getNumFromId(id) {
	return parseInt(id.substr(1, id.length - 1));
}

function getTickCount() {
	const now = new Date();
	const ticks = now.getTime();
	return ticks;
}

const stripXmlEntities = {
	values: {},
	regexp: null,
	init: function() {
		this.values['&#39;'] = "'";
		this.values['&#92;'] = "\\";
		this.values['&quot;'] = '"';
		this.values['&gt;'] = '>';
		this.values['&lt;'] = '<';
		this.values['&amp;'] = '&';
		let regexp_str = new String;
		jQuery.each(this.values, function(k, v) {
			if (regexp_str != '') regexp_str += '|';
			else regexp_str = '(';
			regexp_str += k;
		});
		regexp_str += ')';
		this.regexp = new RegExp(regexp_str, "g");
	},
	perform: function(str) { return str.replace(this.regexp, function (val) { return stripXmlEntities.values[val]; }); }
}
stripXmlEntities.init();

function saveWindowToCookie(wnd, state) {// stores state of a window (opened/closed) in the cookie
	windowsList[wnd] = state;
	let windows = new Array();
	jQuery.each(windowsList, function(k, v) {
		if (v) {windows.push(k);}
	});
	$.cookie('windows', windows.join('.'), { expires: 365, path: '/'} );
}

function reopenWindows() { // restores open windows
	if (isWorking || !fb || fb && (fb.isPlaying == '1' && fb.helper1 == '')) {// try again if something is loading while we're trying to mangle with windows
		setTimeout('reopenWindows()', 500);
	} else {
		let cookie = $.cookie('windows');
		if (cookie) {
			let values = cookie.split('.');
			jQuery.each(values, function(k,v) {
				switch (v) {
					case 'pbs_dlg':		$('#pbs_btn').click(); break;
					case 'pt_dlg':		$('#pt_btn').click(); break;
					case 'pm_dlg':		$('#pm_btn').click(); break;
					case 'aa_pane':		$('#aa_btn').click(); break;
					case 'cl_pane':		$('#cl_btn').click(); break;
					case 'browse_dlg':	$('#browse_btn').click(); break;
					case 'search_dlg':	$('#search_btn').click(); break;
					case 'help_dlg':	$('#help_btn').click(); break;
				};
			});
		}
	}
}

function restorePlaylistSize() {
	if (isWorking || !fb) {
		setTimeout('restorePlaylistSize()', 250);
	} else {
		let cookie = $.cookie('pl_size');
		if (cookie) {
			let pl_size = cookie.split('.');
			if (pl_size.length == 2) {
				let diff = $('#tabs').width() - parseInt(pl_size[0]);
				$('#tabs').width(parseInt(pl_size[0]));
				$('#progressbar').width($('#progressbar').width() - diff);
				if (fb.playlistItemsPerPage != pl_size[1]) {
					retrieveState('PlaylistItemsPerPage', pl_size[1]);
				}
			}
		}
	}
}

function savePlaylistSize(rows) {
	if (fb) {
		rows = rows || fb.playlistItemsPerPage;
		$('#tabs').height('auto');
		$.cookie('pl_size', [$('#tabs').width(), rows].join('.'), { expires: 365, path: '/'} );
	}
}

function setPlaylistRowCount(rows) {
	if (!isNaN(rows)) {
		savePlaylistSize(rows);
		$('#tabs').height('auto');	
		retrieveState('PlaylistItemsPerPage', rows);
	}
}

function getValuesFromCookie(name) {// array of left, top, width, height
	let cookie = $.cookie(name);
	let values = ['auto', 'auto', 'auto', 'auto'];
	if (cookie) {
		let values_cookie = cookie.split('.');
		for (let i = 0; i < values_cookie.length && i < values.length; ++i) {
			if (!isNaN(values_cookie[i])) {values[i] = parseInt(values_cookie[i]);}
		}
	}
	return values;
}

function saveDialogPositionToCookie(name, ui) {
	let values = getValuesFromCookie(name);
	if (ui.position) {
		values[0] = Math.abs(Math.round(ui.position.left));
		values[1] = Math.abs(Math.round(ui.position.top));
	}
	if (ui.size) {
		values[2] = Math.abs(Math.round(ui.size.width));
		values[3] = Math.abs(Math.round(ui.size.height));
	}
	$.cookie(name, values.join('.'), { expires: 365, path: '/'} );
}

function saveDivPositionToCookie(name) {
	let values = getValuesFromCookie(name);
	let div = document.getElementById(name);
	if (div) {
		values[0] = Math.round(div.offsetLeft);
		values[1] = Math.round(div.offsetTop);
		values[2] = Math.round(div.offsetWidth);
		values[3] = Math.round(div.offsetHeight);
	}
	$.cookie(name, values.join('.'), {expires: 365, path: '/'} );
}


function setDialogState(dlg, values) {
	if (values && (values.length == 4)) {
		dlg.dialog('option', 'position', [values[0],values[1]]);
		if (values[2] != 'auto') {dlg.dialog('option', 'width', values[2]);}
		if (values[3] != 'auto') {dlg.dialog('option', 'height', values[3]);}
	} else {
		positionDialog(dlg, mouse.x, mouse.y + 15);
	}
}

function blinkDialog(dlg) {
	if (dlg.dialog('isOpen')) {
		dlg.dialog('close');
		dlg.dialog('open');
	}
}


function checkHotkeys(code) {
	if (selection.count) {
		switch (code) {
			case 81: // q
				$('#QueueItems').click();
				break;
			case 87: // w
				$('#DequeueItems').click();
				break;
			case 46: // del
				$('#Del').click();
				break;
			case 48: // 0
				$('#RatingReset').click();
				break;
			case 49: // 1
				$('#RatingOne').click();
				break;
			case 50: // 2
				$('#RatingTwo').click();
				break;
			case 51: // 3
				$('#RatingThree').click();
				break;
			case 52: // 4
				$('#RatingFour').click();
				break;
			case 53: // 5
				$('#RatingFive').click();
				break;
			case 107: // +
				$('#RatingPlus').click();
				break;
			case 109: // -
				$('#RatingMinus').click();
				break;
			default:
		}
	}

	switch (code) {
		case 85: // u
			$('#Undo').click();
			break;
		case 82: // r
			$('#Redo').click();
			break;
		case 32: // space
			$('#PlayOrPause').click();
			break;
		case 70: // f
			$('#FocusOnPlaying').click();
			break;
		case 83: // s
			$('#SAC').click();
			break;
		case 40: // Down
		case 38: // Up
			const delta = code === 40 ? 1 : -1;
			const offset = code === 40 ? selection.highest : selection.lowest;
			if (!keyPressed[16]) {selection.reset();} // shift
			selection.items[offset + delta] = true;
			selection.calc();
			updatePlaylist();
			break;
		case 34: // PageUp
		case 33: // PageDown
			if (keyPressed[16] && fb){ // shift 
				setPlaylistRowCount(parseInt(fb.playlistItemsPerPage) + parseInt(code == 33 ? -1 : 1));
			}
			break;
		default:
	}
}

function keyDown(e) { 
	if (e == 16 || e == 17) { // shift or ctrl
		keyPressed[e] = getTickCount();
	} else if (!inputHasFocus) {
		checkHotkeys(e);
	}
}

function keyUp(e) { 
	keyPressed[e] = 0;
}

function startWork() {
	isWorking = true;
    document.body.style.cursor = 'wait';
	$("#loading").css("visibility", "visible");
}

function finishWork() {
	isWorking = false;
	$("#loading").css("visibility", "hidden");

    document.body.style.cursor = 'default'; // When the window has finished loading, set it back to default...
}

function pad(str, chr, count) {
	let str_out = str.toString();
	while (str_out.length < count) {str_out = chr + str_out;}
	return str_out;
}

function formatTime(time) {
	const hours = Math.floor(time / 3600);
	const mins = Math.floor((time - hours * 3600) / 60);
	const secs = pad(time % 60, '0', 2);
	if (hours) {return [hours, pad(mins, '0', 2), secs].join(':');}
	else {return [mins, secs].join(':');}
}

function selectAlbum(pitem) {
	if (!keyPressed[16]) {selection.reset();}
	const shift = (fb.playlistPage - 1) * fb.playlistItemsPerPage;
	let artist = '';
	let album = '';
	const len = fb.playlist.length;
	for (let i = pitem - shift,k = (fb.playlistPage - 1) * fb.playlistItemsPerPage + pitem - shift; i < len; ++i,++k) {
		let row = fb.playlist[i];
			if (artist === '' && album  === '') {
				artist = row.a;
				album = row.b;
			}
			if (artist == row.a && album == row.b) {selection.items[k] = true;} 
			else {break;}
	}
	updatePlaylist();
}

function volumeFromSlider(ui) {
	let dbCommand;
	let msg = '';
 	if (ui.value == 0) { // mute
		msg = 'Mute'; 
		dbCommand = 1000; // -100dB
	} else {
		let volumedb = (134 - ui.value) * 0.5 * (-1);
		msg = volumedb.toFixed(1) + 'dB'; 
		dbCommand = Math.round(volumedb * (-10));
	}
	command('VolumeDB', dbCommand);
	return msg;
}

function toggleState(selector,condition) {
	if (condition) {$(selector).removeClass('ui-state-disabled');}
	else {$(selector).addClass('ui-state-disabled');}
}

function updatePreferencesDynamic() {
	toggleState('#RemovePlaylist,#RenamePlaylist,#PTRemovePlaylist,#PTRenamePlaylist', fb.playlists.length);
	toggleState('#EmptyPlaylist,#QueueRandomItems,#PTEmptyPlaylist', fb.playlist.length && fb.playlists.length);
	toggleState('#InputSort', fb.playlist.length);
	toggleState('#Undo,#PTUndo', fb.isUndoAvailable =='1');
	toggleState('#Redo,#PTRedo', fb.isRedoAvailable =='1');
	toggleState('#FocusOnPlaying,#PTFocusOnPlaying', fb.isPlaying == '1' || fb.isPaused == '1');
	toggleState('#QueueItems,#DequeueItems,#Del', selection.count);
	// toggleState('#SetFocus,#PTSetFocus', selection.count === 1);
	toggleState('#FlushQueue', fb.queueTotalTime);
	// toggleState('#Copy,#Paste', selection.count);
	toggleState('#InputCC', selection.count);
	toggleState('#R1, #R2, #R3, #R4, #R5, #RPLUS, #RMINUS, #R0', selection.count);
	toggleState('#CC1, #CC2, #CC3, #CC4, #CC5, #CC6, #CC7, #CC8', selection.count);
	updateButtonsCheck();
	toggleState('#prevpage_btn', fb.playlistPage - 1);
	toggleState('#nextpage_btn', fb.playlistPage == 1 && Math.ceil(fb.playlistItemsCount / fb.playlistItemsPerPage) == 0 ? 0 : fb.playlistPage - Math.ceil(fb.playlistItemsCount / fb.playlistItemsPerPage));
	
	let title = fb.playlistPage != 1 ? 
					'Page ' + (fb.playlistPage - 1) + '/' + Math.ceil(fb.playlistItemsCount / fb.playlistItemsPerPage) : ''
	$('#prevpage_btn').attr('title', title);
	
	title = (fb.playlistPage - Math.floor(fb.playlistItemsCount / fb.playlistItemsPerPage) - 1 != 0) ? 
					'Page ' + (fb.playlistPage + 1) + '/' +Math.ceil(fb.playlistItemsCount / fb.playlistItemsPerPage) : ''
	$('#nextpage_btn').attr('title', title);
	
	title = selection.count === 0 ? 'Clear selection' : selection.count === 1 ? 'Set focus' : 'Set selection (' + selection.count + ' items)'
	$('#SetFocus,#PTSetFocus').attr('title', title);
}

function updateBrowser() {
	let tmp;
	const a = [];
	let len = br.path.length;
	for (let i = 0; i < len; ++i) {
		const row = br.path[i];
		a.push(['<a href="#" onclick="brOffsets[\'',br.pathcurrent,'\']=$(\'#browse_dlg\').scrollTop(); retrieveBrowserState(\'', row.cmd, '\');">', row.path.substring(0, row.path.length - 1), '</a>'].join(''));
	}
	
	$('#browse_path').html(a.join(' &gt; '));
	
	if (br.pathcurrent != '%20') {
		brParams.cmdenqueue = 'Browse&param1='+br.pathcurrent+'&param2=EnqueueDir&';
		brParams.cmdenqueuenested = 'Browse&param1='+br.pathcurrent+'&param2=EnqueueDirSubdirs&';
		$('#browse_parent').text('[ .. ]');
		$('#browse_parent').off('click');
		$('#browse_parent').click(function() { brOffsets[br.pathcurrent]=$('#browse_dlg').scrollTop(); retrieveBrowserState(br.parent); });
	} else {
		brParams.cmdenqueue = '';
		brParams.cmdenqueuenested = '';
		$('#browse_parent').text('');
		$('#browse_parent').off('click');
		$('#browse_parent').click(function() {  } );
	}
	
	len = br.browser.length;
	tmp = '<table class="pl"><tr><td colspan="4">';
	tmp += ['<tr class=br_o>','<td style="width:90%">Path</td>','<td nowrap class="bt-r">Size</td>','<td nowrap class="bt-r">Ext</td>','<td nowrap class="bt-r">Date</td></tr>'].join('')
	for (let i = 0; i < len; ++i) {
		const row = br.browser[i];
		const st = [];
		if (i % 2) {st.push('br_o');}
		if (!row.pu) {st.push('br_g');}
		if (row.pu && !row.cm && row.fs) {row.cm = 'Extra format';}
		if (st.length) {
			tmp += ['<tr class="', st.join(' '), '">'].join('');
		} else {
			tmp += '<tr>';
		}
		if (row.pu) {
			tmp += ['<td style="width:90%"><a href="#" onclick="br_parent_path=\'', row.pu, '\'; brOffsets[\'',br.pathcurrent,'\']=$(\'#browse_dlg\').scrollTop(); retrieveBrowserState(\'', row.pu, '\');">', row.p, '</a></td>'].join('');
		} else {
			tmp += ['<td style="width:90%">', row.p, '</td>'].join('');
		}
		tmp += ['<td nowrap class="bt-r" style="text-align: right">', row.fs, '</td>',
			'<td nowrap class="bt-r">', row.cm, '</td>',
			'<td nowrap class="bt-r">', row.ft.split(' ')[0], '</td></tr>'].join('');
	}
	tmp += '</table>';
	$('#browse_table').html(tmp);
	if (brOffsets.hasOwnProperty(br.pathcurrent)) {$('#browse_dlg').scrollTop( brOffsets[br.pathcurrent] );}
}

function switchPage(shift) {
	if (mouse.down && drag.dragging) {retrieveState('P', fb.playlistPage + shift);}
}

function updatePlaylistSortable() {
	$("#pl div[id*='i']").mousedown(function() {
		drag.start = getNumFromId($(this).attr('id'));
		mouse.down = true;
		selection.calc();
	})
	.mouseup(function() {
		if (drag.dragging) {
			let shift = drag.end - selection.lowest;
			if (selection.count > 1 && shift > 0) {shift -= selection.count - 1;}
			selection.calc();
			if (shift != 0 & selection.count > 0) {command('Move', selection.toStr(), shift);}
			else {$("#pl div[id*='i']").removeClass('dragplacer-top').removeClass('dragplacer-bottom');}
			selection.reset();
		}
		mouse.reset();
		drag.reset();
	})
	.mousemove(function() {
		if (mouse.down) {
			tooltip.show(selection.toStr());
			if (!drag.dragging) {
				drag.dragging = true;
				if (!$('#i' + drag.start).hasClass('pl_selected')) {
					$("#pl div[id*='i']").removeClass('pl_selected');
					selection.reset();
					selection.items[drag.start] = true;
					$('#i' + drag.start).addClass('pl_selected')
				}
				selection.calc();
			}
			drag.end = getNumFromId($(this).attr('id'));
			let cl = '';
			clearTimeout(drag.timeout)
			if (mouse.y < $(this).offset().top + $(this).height() / 2) {
				if (!$('#i'+(drag.end-1)).hasClass('dragplacer-bottom') && !$('#i'+(drag.end-1)).hasClass('pl_selected')) {
					cl = 'dragplacer-top';
				}
				if (drag.end > drag.start) {
					drag.end -= 1;
				}
				if (drag.end == (fb.playlistPage - 1) * fb.playlistItemsPerPage && fb.playlistItemsCount > fb.playlistItemsPerPage && fb.playlistPage != 1) {
					drag.timeout = setTimeout('switchPage(-1)', 2000);
				}
			} else {
				if (!$('#i'+(drag.end+1)).hasClass('dragplacer-top') && !$('#i'+(drag.end+1)).hasClass('pl_selected')) {
					cl = 'dragplacer-bottom';
				}
				if (drag.end < drag.start && (drag.end >= (fb.playlistPage-1)*fb.playlistItemsPerPage && drag.end <= ((fb.playlistPage-1)*fb.playlistItemsPerPage + fb.playlistItemsPerPage) )) {
					drag.end += 1;
				}
				if (drag.end >= ((fb.playlistPage - 1) * fb.playlistItemsPerPage+fb.playlistItemsPerPage - 1) && fb.playlistItemsCount > fb.playlistItemsPerPage && fb.playlistPage != Math.ceil(fb.playlistItemsCount / fb.playlistItemsPerPage)) {
					drag.timeout = setTimeout('switchPage(1)', 2000);
				}
			}
			if (cl) {
				$("#pl div[id*='i']").removeClass('dragplacer-top').removeClass('dragplacer-bottom');
				$(this).addClass(cl);
			}
		}
	});
	$('#pl div, span').disableSelection();
}

function updateSelectionStats() {
	selection.calc();
	let totalTime;
	let extraText = '';
	if (fb.isLocked == "1") {extraText = ' Locked | ';}
	if (selection.count > 1) {totalTime = [formatTime(selection.length), '/', fb.playlistTotalTime].join('');} 
	else {totalTime = fb.playlistTotalTime;}
	if (fb.queueTotalTime) {$('#totaltime').text([extraText, '(', fb.queueTotalTime, ') ', totalTime].join(''));}
	else {$('#totaltime').text(extraText + totalTime);}
	updatePreferencesDynamic();
}

function updatePlaylist() {
	const shift = (fb.playlistPage - 1) * fb.playlistItemsPerPage;
	let npt = fb.playingItem;
	if (!isNaN(npt)) {npt = fb.playingItem - shift;}
	const npp = fb.playlistPlaying;
	const ap = fb.playlistActive;
	const ppt = fb.prevplayedItem  - shift;
	const ft = fb.focusedItem - shift;
	let st;
	let artist;
	let album;
	let group;
	let ta = ['<div id="pl" class="noselect">'];
	let len = fb.playlist.length;
	
	const selectedIcon = '<span class="ui-icon ui-icon-check" style="position: absolute; margin-top: -2px;"></span>';
	const playIcon = '<span class="ui-icon ui-icon-play" style="position: absolute; margin-top: -2px;"></span>';
	const pauseIcon = '<span class="ui-icon ui-icon-pause" style="position: absolute; margin-top: -2px;"></span>';
	for (let i = 0, k = (fb.playlistPage - 1) * fb.playlistItemsPerPage; i < len; ++i,++k) {
		group = '';
		let row = fb.playlist[i];
		let cl_1 = []; let cl_2 = []; let cl_3 = []; let cl_r = [];
		if (album != row.b || artist != row.a) { //  &mdash;
			let rowA = row.a;
			let rowB = row.b;
			if (rowA.length > 30) {rowA = rowA.slice(0, 30); rowA += '...';}
			if (rowB.length > 20) {rowB = rowB.slice(0, 20); rowB += '...';}
			let groupTags = [rowA, ' [', row.d, '] ', rowB].join('');
			if (npt == i && ap == npp) {
				group = ['<span class="pl-album_play" id="n', k, '"> / ', groupTags, "</span>"].join('');
			} else {
				group = ['<span class="pl-album" id="n', k, '"> / ', groupTags, "</span>"].join('');
			}
			artist = row.a;
			album = row.b;
			if (i != 0 && ft != i) {
				cl_1.push('bbt'); cl_2.push('bbt'); cl_3.push('bbt');
			}
		}
		if (i % 2 == 0) {cl_r.push('pl_even');}
		row.n = row.n.replace(selectedIcon, '');
		if (npt === i && ap == npp) {
			cl_r.push('pl_play');
			if (fb.isPlaying == '1') {
				row.n = [playIcon, row.n].join('');
			} else if (fb.isPaused == '1') {
				row.n = [pauseIcon, row.n].join('');
			}
		} else {
			if (npt !== i && selection.items.hasOwnProperty(shift + i)) {
				row.n = [selectedIcon, row.n].join('');
			}
		}
		
		if (ppt == i) {	cl_r.push('pl_prev');}
		if (ft == i) {
			cl_1.push('bbl bbm'); cl_2.push('bbm'); cl_3.push('bbm bbr');
		} else {
			cl_1.push('bwl bwm'); cl_2.push('bwm '); cl_3.push('bwm bwr');
		}
		if (cl_1.length == 0)
			cl_1.push('bwm');
		let rowT = row.t;
		if (rowT.length > 30) {rowT = rowT.slice(0, 30); rowT += '...';}
		ta.push(['<div id="i', k, '" class="pl_row ', cl_r.join(' '), '">',
			'<div class="pl_c1 ', cl_1.join(' '), '">', row.n, '.</div>',
			'<div class="pl_c2 ', cl_2.join(' '), '">', rowT, group, '</div>',
			'<div class="pl_c3 ', cl_3.join(' '), '">', row.r, '&ensp;', row.l, '</div></div>'].join(''));
	}
	let a = [];
	len = fb.playlistItemsPerPage - fb.playlist.length;
	for (let i = 0; i < len; ++i) {
		a.push('<div class="pl_row"><div class="pl_c1">&nbsp;</div><div class="pl_c2">&nbsp;</div><div class="pl_c3">&nbsp;</div></div>');
	}
	ta.push([a.join(''), '</div>'].join(''));
	
	$('#playlist').html(ta.join(''));
	let playingItem = isNaN(fb.playingItem) ? '?' : fb.playingItem + 1;
	let tmp = '';
	
	if (fb.isPlaying == "1") {
		tmp += ['Playing ', playingItem, ' of ', fb.playlistPlayingItemsCount, ' | ', fb.helper3].join('');
	} else {
		if (fb.isPaused == "1") {tmp += ['Paused ', playingItem, ' of ', fb.playlistPlayingItemsCount, ' | ', fb.helper3].join('');}
		else {tmp += 'Stopped ';}
	}
	
	tmp += '<span id="totaltime" style="float: right"></span>';
	if (fb.isLocked == "1") {
		tmp += '<span class="ui-icon ui-icon-locked noselect" style="float: right; background-position: -192px -97.5px; transform: scale(1.2); -ms-transform: scale(1.2); -webkit-transform: scale(1.2);"></span>';
		// red icons_cd0a0a_256x240
	} else {
		
	}
	$('#summary').html(tmp);
	let pageslider = $('#pageslider');
	
	if (fb.playlistItemsCount > fb.playlistItemsPerPage) {
		pageslider.slider('option', 'max', Math.ceil(fb.playlistItemsCount * 1.0 / fb.playlistItemsPerPage));
		pageslider.slider('value', fb.playlistPage);
		pageslider.slider('enable');
	} else {
		pageslider.slider('disable');
		pageslider.slider('value', 1);
		pageslider.slider('option', 'max', 1);
	}
	
	updatePlaylistSortable();
	
	$.each(selection.items, function(k,v) {
		if (v) {$('#i'+k).addClass('pl_selected');}
	});
	
	$("#pl span[id*='n']").off('click');
	$("#pl span[id*='n']").click(function() {
		setTimeout(() => {selectAlbum(getNumFromId($(this).attr('id')));}, 200); // Give a 200ms window for dblclick
	})
	.dblclick(function() {
		command('Start', getNumFromId($(this).attr('id')), void(0), true);
	});
	
	$("#pl div[id*='i']").off('dblclick').off('click');
	$("#pl div[id*='i']").dblclick(function() {
			$("#pl div[id*='i']").removeClass('pl_selected');
			command('Start', getNumFromId($(this).attr('id')), void(0), true);
		})
		.click(function() {
			let i = getNumFromId($(this).attr('id'));
			selection.calc();
			if (keyPressed[16] && selection.count) { // shift
				$("#pl div[id*='i']").removeClass('pl_selected');
				let start = 0; let end = 0;
				if (i < selection.lowest) {
					start = i;
					end = selection.highest;
				}
				if (i > selection.highest) {
					start = selection.lowest;
					end = i;
				}
				selection.reset();
				for (let k = start; k <= end; ++k) {
					$('#i'+k).addClass('pl_selected');
					selection.items[k] = true;
				}
			} else if (keyPressed[17]) { // ctrl
				if (selection.items[i]) {
					$(this).removeClass('pl_selected');
					selection.items[i] = false;
				} else {
					$(this).addClass('pl_selected');
					selection.items[i] = true;
				}
			} else {
				$("#pl div[id*='i']").removeClass('pl_selected');
				selection.reset();
				selection.items[i] = true;
				$(this).addClass('pl_selected');
			}
			updateSelectionStats();
			setTimeout('updatePlaylist()', 200); // Give a 200ms window for dblclick
		})
		.disableSelection();
	
	updateSelectionStats();
}

function updateNp() {
	if (!fb) {return;}
	let pos = parseInt(fb.itemPlayingPos) || 0;
	let len = parseInt(fb.itemPlayingLen) || -1;
	clearTimeout(npid);
	if (pos >= len && pos && len != -1) {
		retrieveState();
		return;
	}
	if (len > 0) {
		$("#progressbar").progressbar('enable').progressbar('option', 'max', len); // % 10 second resolution
		$("#progressbar").progressbar('value', pos);
		if (pos < len) {
			fb.itemPlayingPos = pos + 1;
			$("#playingtime").html("-" + formatTime(len-pos));
			if (fb.isPlaying == "1") {npid = setTimeout('updateNp()', refreshInterval);}
		}
	} else if (fb.isPlaying != "1" && fb.isPaused != "1") {
		$("#progressbar").progressbar('disable').progressbar('value', 0);
		$("#playingtime").html("");
	}
	if (fb.isPlaying == "1" && len == -1) {
		$("#progressbar").progressbar('enable').progressbar('value', 0);
		fb.itemPlayingPos = pos + 1;
		$("#playingtime").html(formatTime(pos));
		if (pos % 15 == 0) {
			retrievestate_schedule(1100, "RefreshPlayingInfo");
		} else {
			npid = setTimeout('updateNp()', refreshInterval);
		}
	}

}

function updateTabs() {
	const tc = parseInt($("#tabs >ul >li").size());
	const fp = parseInt(fb.playlists.length);
	const tabs = $('#tabs');
	settingTabs = true;
	
	if (tc < fp) {
		for (let i = 0; i < fp - tc; ++i) {
			$( "<li><a href='#t'></a></li>" ).appendTo( "#tabs .ui-tabs-nav" );
			$( "#tabs" ).tabs('refresh');
		}
	}
	if (tc > fp) {
		for (let i = 0; i < tc - fp; ++i) {
			$( "#tabs" ).find( ".ui-tabs-nav li:eq(" + (i + 1) + ")" ).remove();
			$( "#tabs" ).tabs('refresh');
		}
	}
	
	for (let i = 0; i < fp; ++i) {
		if (fb.playlistPlaying == i) {
			let c = ''
			if (fb.isPlaying == '1') {
				c = '<span class="ui-icon ui-icon-play noselect"';
			} else if (fb.isPaused == '1') {
				c = '<span class="ui-icon ui-icon-pause noselect"';
			}
			$("#tabs a:eq(" + i + ")").html([c, ' style="position: absolute; margin-top: -2px; margin-left: -5px;"></span><span style="margin-left: 12px;">', fb.playlists[i].name, '</span>'].join(''));
		} else {
			$("#tabs a:eq(" + i + ")").html(['<span>', fb.playlists[i].name, '</span>'].join(''));
		}
	}
//	tabs.tabs('select', parseInt(fb.playlistActive));
//	let index = $('#tabs a[href="#simple-tab-2"]').parent().index();
	$("#tabs").tabs("option", "active", parseInt(fb.playlistActive));
	settingTabs = false;
}

function updateAlbumartAspect() {
	if (aa.img.width == 0 || aa.img.height == 0) {setTimeout('updateAlbumartAspect()', refreshInterval);}
	else {
		if ($('#aa_pane').hasClass("ui-resizeable")) {$('#aa_pane').resizable('destroy');}
		$('#aa_pane').resizable({
			alsoResize: "#aa_img",
			handles: 'all',
			aspectRatio: aa.img.width/aa.img.height,
			stop: function (event, ui) { 
				saveWindowToCookie('aa_pane', true);
				saveDivPositionToCookie('aa_pane');
			}
  		});
	}
}

function updateAlbumart() {
	if ($('#aa_pane').is(':visible')) {
		aa.img = new Image();
		aa.img.src = fb.albumArt;
		$('#aa_img').attr('src', aa.img.src);
		updateAlbumartAspect();
	}
}

function updateConsole(maxLines = log.maxLines) {
	startWork();
	if ($('#cl_pane').is(':visible')) {
		$.get('xxx/console.log', function(data) {
			if (data.length) {
				data = data.split('\n');
				const lines = data.length;
				cl_text.innerHTML = lines > maxLines ? data.slice(data.length - maxLines).join('\n'): data.join('\n');
			} else {cl_text.innerHTML = 'No console log found.';}
		}, 'text')
		.always(function() {
			finishWork();
		});
	} else {
		finishWork();
	}
}

function updateLibrary() {
	// Items
	const list = [];
	let len = library.query.length;
	for (let i = 0; i < len; ++i) {
		list.push(['<div id="qr" ', (i % 2 == 0 ? 'class=""' : 'class="pl_even"'), '>', stripXmlEntities.perform(library.query[i]), '</div>'].join(''));
	}
	$('#querylist').html(list.join(''));
	$('#querylist div').hover(function() { $(this).addClass('qr_selected'); }, function() { $(this).removeClass('qr_selected'); })
				.off('click').click(function() {retrieveLibraryState('QueryAdvance', ($(this).text())); });
	// Current Path
	len = library.queryInfo.length;
	const currSearch = $('#searchstr').val().length;
	if (len < 1 && currSearch) {$('#r_btn').html('Filter');}
	else if (len < 1 && !currSearch) {$('#r_btn').html('Retrieve list');}
	else {$('#r_btn').text('<');}
	const path = [];
	for (let i = 0; i < len; ++i) {
		const name = stripXmlEntities.perform(library.queryInfo[i]);
		path.push(i === 0 ? '[' + name + ']' : name);
	}
	$('#querypath').html(path.join(' > '));
}

function updateUI() {
	if (fb) {
		document.title = stripXmlEntities.perform(fb.helper1) + ' foobar2000';
		// Set progress bar
		if (fb.isPlaying == '1' || fb.isPaused == '1') {
			let playingTitle = fb.helper2;
			$('#playingtitle').html(fb.helper2);
			// Responsive design
			const maxWidth = document.documentElement.clientWidth * 0.75;
			while ($('#playingtitle').width() > maxWidth) {
				playingTitle = playingTitle.substring(0, playingTitle.length - 10) + '...';
				$('#playingtitle').html(playingTitle);
			}
			// Pause/play
			if (fb.isPlaying == '1') {$("#PlayOrPause").html('<span class="ui-icon ui-icon-pause"></span>');}
			else {$('#PlayOrPause').html('<span class="ui-icon ui-icon-play"></span>');}
		} else {
			$("#playingtitle").html('&nbsp;');
			$('#PlayOrPause').html('<span class="ui-icon ui-icon-play"></span>');
		}
		
		if (fb.SAC === 'checked') {$('#progressbar').addClass('ui-state-error');}
		else{$('#progressbar').removeClass('ui-state-error');}
		
		const volume_value = fb.volumedb == "1000" ? 0 : 134 - Math.round(parseInt(fb.volumedb) / 10.0 / 0.5);
		$("#volume").slider("value", volume_value);
		
		if (fb.volumedb == 1000) {$('#mute').addClass('ui-state-error').attr('title', 'Unmute');}
		else {$('#mute').removeClass('ui-state-error').attr('title', 'Mute');}
		
		$("#SAC").prop('checked', fb.SAC === "checked");
		$("#SAQ").prop('checked', fb.SAQ === "checked");
		$("select#PBO").val(fb.playbackOrder);
		
		if (!drag.dragging) {
			mouse.reset();
			drag.reset();
			selection.reset();
		}
		updateAlbumart();
		updatePlaylist();
		updateTabs();
		updatePreferencesDynamic();
	}
	updateSMPUI();
	updateContextUI();
	updateConsole();
	updateNp();
	tooltip.hide();
}

function updateButtonsCheck() {
	if (!xxx) {return false;}
	if (!smp) {return false;}
	if (xxx.hasOwnProperty('contextMenus')) {
		const menuLength = xxx.contextMenus.length;
		for (let i = 1; i <= menuLength; i++) {
			const currMenu = xxx.contextMenus[i - 1];
			checkComponentMenu(currMenu, '#CC' + i);
		}
		for (let i = 1 + menuLength; i <= 8; i++) {toggleState('CC' + i, false);}
	}
}

function checkComponentMenu(currMenu, currId) {
	if (!smp) {return false;}
	if (currMenu.hasOwnProperty('component') && currMenu.component !== '') {
		if (smp.hasOwnProperty('components') && smp.components.hasOwnProperty(currMenu.component) && !smp.components[currMenu.component]) {
			toggleState(currId, false);
			return false;
		}
	}
	return true;
}

function updateContextUI() {
	if (!xxx) {return false;}
	if (!smp) {return false;}
	if (xxx.hasOwnProperty('contextMenus')) {
		const menuLength = xxx.contextMenus.length;
		for (let i = 1; i <= menuLength; i++) {
			const button = document.getElementById('CC' + i);
			const currMenu = xxx.contextMenus[i - 1];
			button.title = currMenu.name + '\nContextual Menu: ' + currMenu.menu;
			button.children[0].setAttribute('class', 'ui-icon ui-icon-circle-check');
			// Rewrite if menu has its own icon or tooltip
			if (currMenu.hasOwnProperty('icon') && currMenu.icon !== '') {button.children[0].setAttribute('class', currMenu.icon);}
			if (!checkComponentMenu(currMenu, '#CC' + i)) {button.title += ' (requires ' + currMenu.component + ')';}
			if (currMenu.hasOwnProperty('tooltip') && currMenu.tooltip !== '') {button.title += '\n' + currMenu.tooltip}
		}
		for (let i = 1 + menuLength; i <= 8; i++) {
			const button = document.getElementById('CC' + i);
			button.children[0].setAttribute('class', 'ui-icon ui-icon-circle-close');
			toggleState('CC' + i, false);
		}
	}
}

function updateSMPConfig() {
	if (!smp) {return false;}
	// Check components
	if (smp.hasOwnProperty('components')) {
		if (smp.components.hasOwnProperty('foo_run_main') && smp.components.hasOwnProperty('foo_runcmd') && smp.components.foo_run_main && smp.components.foo_runcmd) {
			smp.config.bRunCmd = true; // Use CMD methods
		}
		if (smp.config.bRunCmd && smp.components.hasOwnProperty('bDynamicMenusPT') && smp.components.bDynamicMenusPT) {
			smp.config.bDynamicMenusPT = true; // Use Dynamic Menus
		}
	}
}

function updateSMPUI() {
	if (!smp) {return false;}
	updateSMPConfig();
	let bEnabledDsp = false;
	let bEnabledDevice = false;
	let bEnabledMenuList = false;
	let bEnabledManager = false;
	let bEnabledPlsToolsCMD = false;
	let bEnabledPlsToolsCMDDyn = false;
	
	// Check components
	if (smp.config.bRunCmd) {
		bEnabledDsp = true;
		bEnabledDevice = true;
		bEnabledManager = true;
		bEnabledPlsToolsCMD = true;
	}
	if (smp.config.bDynamicMenusPT) {
		bEnabledPlsToolsCMDDyn = true;
	}
	
	// Rewrite SMP buttons
	{
		const menuLength = smp.hasOwnProperty('smpMenus') ? smp.smpMenus.length : 0;
		for (let i = 1; i <= menuLength; i++) {
			const button = document.getElementById('PTSMP' + i);
			const currMenu = smp.smpMenus[i - 1];
			button.title = '(' + i + ') ' + currMenu.name + '\nFunction: ' + currMenu.funcName;
			if (currMenu.name === 'Execute menu entry by name' || currMenu.funcName === 'executeByName') {
				bEnabledMenuList = bEnabledPlsToolsCMD;
				button.children[0].setAttribute('class', 'ui-icon ui-icon-star');
				button.title += '\nUsage:\n- Set desired menu entry on list.\n- Wait for item addition on playlist.\n- Run this menu button afterwards.'
			} else {
				button.children[0].setAttribute('class', 'ui-icon ui-icon-circle-check');
			}
			// Rewrite if menu has its own icon or tooltip
			if (currMenu.hasOwnProperty('icon') && currMenu.icon !== '') {button.children[0].setAttribute('class', currMenu.icon);}
			if (currMenu.hasOwnProperty('tooltip') && currMenu.tooltip !== '') {
				button.title = '(' + i + ') ' + currMenu.name + '\nFunction: ' + currMenu.funcName;
				button.title += '\n' + currMenu.tooltip;
			}
			if (!bEnabledPlsToolsCMD) {
				button.title += '\n-- foo_runcmd or foo_run_main missing --';
				button.children[0].setAttribute('class', 'ui-icon ui-icon-circle-close');
			}
		}
		for (let i = 1 + menuLength; i <= 9; i++) {
			const button = document.getElementById('PTSMP' + i);
			button.title = 'SMP ' + i;
			button.children[0].setAttribute('class', 'ui-icon ui-icon-circle-close');
			if (!bEnabledPlsToolsCMD) {button.title += '\n-- foo_runcmd or foo_run_main missing --';}
		}
	}
		
	const addDisabledNode = (id, nodeText = (bEnabledPlsToolsCMD ? '-- Select an option --' : '-- foo_runcmd or foo_run_main missing --')) => {
		const list = document.getElementById(id);
		while (list.firstChild) {list.removeChild(list.firstChild);}
		const node = new Option(nodeText, -1, true, true);
		node.disabled = true;
		list.appendChild(node);
	};
	// Rewrite Playlist Tools Menu list
	if (!bEnabledPlsToolsCMD || !smp.hasOwnProperty('playlistToolsEntries')) {
		if (!bEnabledManager) {$('#pt_btn').attr('title', 'Playlist Tools (foo_run_main or foo_runcmd not found)');}
	} else {
		$('#pt_btn').attr('title', 'Playlist Tools');
	}
	if (smp.hasOwnProperty('playlistToolsEntries')) {
		const num = smp.playlistToolsEntries.length;
		if (num) {
			const list = document.getElementById('PTME');
			while (list.firstChild) {list.removeChild(list.firstChild);}
			for (let i = -1; i < num; i++) {
				let name = i === -1 ? (bEnabledPlsToolsCMD ? '-- Select an option --' : '-- foo_runcmd or foo_run_main missing --') : smp.playlistToolsEntries[i].name;
				const flags = i === -1 ? 1 : smp.playlistToolsEntries[i].flags;
				if (name === 'sep') {
					name = '---------------------------\n---------------------------'
				} else if (name.split('\\').pop() === 'sep') {
					name = '---------------------------'
				}
				const node = new Option(name, i);
				if (flags === 1 || !bEnabledMenuList || !bEnabledPlsToolsCMD) {node.disabled = true;}
				list.appendChild(node);
			}
			list.selectedIndex = 0; // Index will have an offset due to the first entry being a dummy entry...
		} else {addDisabledNode('PTME');}
	} else {addDisabledNode('PTME');}
	
	// Rewrite Playlist Tools Menu list CMD
	if (smp.hasOwnProperty('playlistToolsEntriesCMD')) {
		const panelKeys = Object.keys(smp.playlistToolsEntriesCMD);
		const panelNum = panelKeys.length;
		if (panelNum) {
			const panelKey = panelKeys[0]; // Only use first one
			const num = smp.playlistToolsEntriesCMD[panelKey].length;
			if (num) {
				const list = document.getElementById('PTMECMD');
				while (list.firstChild) {list.removeChild(list.firstChild);}
				for (let i = -1; i < num; i++) {
					let name = i === -1 ? (bEnabledPlsToolsCMDDyn ? '-- Select an option --' : '-- foo_runcmd or foo_run_main missing --') : smp.playlistToolsEntriesCMD[panelKey][i].name;
					const flags = i === -1 ? 1 : smp.playlistToolsEntriesCMD[panelKey][i].flags;
					if (name === 'sep') {
						name = '---------------------------\n---------------------------'
					} else if (name.split('\\').pop() === 'sep') {
						name = '---------------------------'
					}
					const node = new Option(name, i);
					if (flags === 1 || !bEnabledPlsToolsCMDDyn) {node.disabled = true;}
					list.appendChild(node);
				}
				list.selectedIndex = 0; // Index will have an offset due to the first entry being a dummy entry...
			}
		} else {addDisabledNode('PTMECMD');}
	} else {addDisabledNode('PTMECMD');}
	
	// Rewrite Output devices list
	if (smp.hasOwnProperty('devices')) {
		const num = smp.devices.length;
		if (num) {
			const list = document.getElementById('PTOD');
			while (list.firstChild) {list.removeChild(list.firstChild);}
			for (let i = 0; i < num; i++) {
				let name = smp.devices[i].name;
				let bDisabled = !bEnabledDevice;
				if (name === 'sep') {
					bDisabled = true;
					name = '---------------------------'
				}
				const node = new Option(name, i);
				if (smp.devices[i].active) {node.selected = true;}
				if (bDisabled) {node.disabled = true;}
				list.appendChild(node);
			}
		} else {addDisabledNode('PTOD', ' -- No devices file found  --');}
	} else {addDisabledNode('PTOD', ' -- No devices file found  --');}
	
	// Rewrite DSP list
	if (smp.hasOwnProperty('dsp')) {
		const num = smp.dsp.length;
		if (num) {
			const list = document.getElementById('PTDSP');
			while (list.firstChild) {list.removeChild(list.firstChild);}
			for (let i = 0; i < num; i++) {
				let bDisabled = !bEnabledDsp;
				let name = smp.dsp[i].name;
				if (name === 'sep') {
					bDisabled = true;
					name = '---------------------------'
				}
				const node = new Option(name, i);
				if (smp.dsp[i].active) {node.selected = true;}
				if (!bEnabledDsp) {node.disabled = true;}
				list.appendChild(node);
			}
		} else {addDisabledNode('PTDSP', ' -- No DSP file found  --');}
	} else {addDisabledNode('PTDSP', ' -- No DSP file found  --');}
	
	// Rewrite Playlist Manager
	const addDisabledNodePLM = (nodeText = 'None') => {
		menusPls.forEach((menu) => { // At header
			const list = document.getElementById(menu.id);
			while (list.firstChild) {list.removeChild(list.firstChild);}
			const node = new Option(nodeText, -1, true, true);
			node.disabled = true;
			list.appendChild(node);
		});
	};
	if (!bEnabledManager || !smp.hasOwnProperty('playlistManagerPanels')) {
		if (!bEnabledManager) {$('#pm_btn').attr('title', 'Playlist Manager (foo_run_main or foo_runcmd not found)');}
		if (!smp.hasOwnProperty('playlistManagerPanels')) {$('#pm_num').html('0 (none found)');}
	} else {
		$('#pm_btn').attr('title', 'Playlist Manager');
	}
	if (smp.hasOwnProperty('playlistManagerPanels')) {
		const panelKeys = Object.keys(smp.playlistManagerPanels);
		const panelNum = panelKeys.length;
		if (panelNum) {
			$('#pm_num').html(panelNum + ' found (' + panelKeys.join(', ') + ')');
			menusPls.forEach((menu) => { // At header
				const list = document.getElementById(menu.id);
				while (list.firstChild) {list.removeChild(list.firstChild);}
				smp.playlistManagerEntries[menu.type] = [];
				let listIdx = -1;
				for (let j = 0; j < panelNum; j++) {
					const currPanel = smp.playlistManagerPanels[panelKeys[j]];
					const currMenu = currPanel.hasOwnProperty(menu.type) ? currPanel[menu.type] : null;
					if (!currMenu) {continue;} // Corrupted file or old Playlist Manager version
					const num = currMenu.length;
					for (let i = 0; i < num; i++) {
						let name = listIdx === -1 ? (bEnabledManager ? '-- Select an option --' : '-- foo_runcmd or foo_run_main missing --') : currMenu[i].name;
						if (Array.isArray(menu.name)) {menu.name.forEach((n) => {name = name.replace(n,'');});}
						else {name = name.replace(menu.name,'');}
						let bDisabled = !bEnabledManager || listIdx === -1;
						if (name === 'sep') {
							bDisabled = true;
							name = '---------------------------\n---------------------------'
						} else if (name.split('\\').pop() === 'sep') {
							bDisabled = true;
							name = '---------------------------'
						} else if (name.endsWith(':')) {
							bDisabled = true;
						}
						const node = new Option(name, listIdx);
						if (bDisabled) {node.disabled = true;}
						list.appendChild(node);
						if (listIdx !== -1) {smp.playlistManagerEntries[menu.type].push(currMenu[i]);}
						else {i--;}
						listIdx++;
					}
				}
				list.selectedIndex = 0; // Index will have an offset due to the first entry being a dummy entry...
			});
			// Playlist list
			if (smp.hasOwnProperty('playlistManagerPls') && Object.keys(smp.playlistManagerPls).length) {
				const menu = menusPls[0];
				const list = document.getElementById(menu.id);
				while (list.firstChild) {list.removeChild(list.firstChild);}
				for (let j = 0; j < panelNum; j++) {
					const currPanel = smp.playlistManagerPls[panelKeys[j]];
					if (!currPanel) {continue;} // Corrupted file or old Playlist Manager version
					const num = currPanel.length;
					for (let i = -1; i < num; i++) {
						const pls = currPanel[i];
						if (i === -1) {
							name = bEnabledManager ? '-- ' + panelKeys[j] + ' --' : '-- foo_runcmd or foo_run_main missing --';
						} else {
							name = pls.name + ' (' + (pls.extension || 'AutoPlaylist') + ')' + ' {' + pls.size + ' tracks - ' + (pls.isLocked ? 'R' : 'RW') + ' - ' + secondsToStr(pls.duration) + '}';
						}
						const node = new Option(name, i);
						node.disabled = true;
						list.appendChild(node);
					}
				}
				list.selectedIndex = 0; // Index will have an offset due to the first entry being a dummy entry...
			} else {addDisabledNodePLM();}
		} else {$('#pm_num').html('0 (none found)'); addDisabledNodePLM();}
	} else {addDisabledNodePLM();}
	return true;
}

function command(command, p1, p2, bPreserveSel = false) {
	startWork();
	
	let params = {};
	if (command) params['cmd'] = command;
	if (p1 || p1 == 0) params['param1'] = p1;
	if (p2 || p2 == 0) params['param2'] = p2;
	params['param3'] = 'NoResponse';
	
	$.get('/ajquery-xxx/', params, function (data) {
		if (!(command == "VolumeDB")) {retrievestate_schedule(command == 'Start' ? 500 : 250, void(0), bPreserveSel);}
		else {finishWork();}
	})
	.fail(function() {
		finishWork();
	});
}

function retrievestate_schedule(timeout, cmd, bPreserveSel) {
	timeout = timeout || 500;
	cmd = cmd || '';
	if (timeoutId) {
		clearTimeout(timeoutId);
		timeoutId = null;
	}
	if (!timeoutId) {timeoutId = setTimeout('retrieveState("'+ cmd +'",void(0),' + bPreserveSel + ')', timeout);}
}

function retrieveXXX() {
	xxx = {};
	xxx.contextMenus = [];
	try {$.getJSON('xxx/config-contextmenus.json', function (data) {xxx.contextMenus = data;});} catch (e) {}
	
	xxx.theme = '';
	try {
		$.getJSON('xxx/config-theme.json', function (data) {
			xxx.theme = data[0].value;
			if (xxx.theme && xxx.theme.length) {document.documentElement.setAttribute("data-theme", xxx.theme);}
		}); 
	}catch (e) {}
}

function retrieveSMP() {
	smp = {};
	smp.smpMenus = [];
	try {$.getJSON('smp/smpmenus.json', function (data) {smp.smpMenus = data;});} catch (e) {}
	
	smp.playlistToolsEntries = [];
	try {$.getJSON('smp/playlisttoolsentries.json', function (data) {smp.playlistToolsEntries = data;});} catch (e) {}
	
	smp.playlistToolsEntriesCMD = [];
	try {$.getJSON('smp/playlisttoolsentriescmd.json', function (data) {smp.playlistToolsEntriesCMD = data;});} catch (e) {}
	
	smp.devices = [];
	try {$.getJSON('smp/devices.json', function (data) {smp.devices = data;});} catch (e) {}
	
	smp.dsp = [];
	try {$.getJSON('smp/dsp.json', function (data) {smp.dsp = data;});} catch (e) {}
	
	smp.components = {};
	try {$.getJSON('smp/components.json', function (data) {smp.components = data;});} catch (e) {}
	
	smp.playlistManagerPanels = [];
	smp.playlistManagerEntries = {};
	try {$.getJSON('smp/playlistmanagerentries.json', function (data) {smp.playlistManagerPanels = data;});} catch (e) {}
	
	smp.playlistManagerPls = {};
	try {$.getJSON('smp/playlistmanagerpls.json', function (data) {smp.playlistManagerPls = data;});} catch (e) {}
	
	smp.config = {bRunCmd: false, bDynamicMenusPT: false};
}

function retrieveState(cmd, p1, bPreserveSel) {
	startWork();
	
	if (timeoutId) {
		clearTimeout(timeoutId);
		timeoutId = null;
	}
	cmd = (cmd || '').toString();
	p1 = (p1 || '').toString();
	cmd = cmd.length ? ['?cmd=', cmd, '&'].join('') : '?';
	p1 = p1.length ? ['&param1=', p1, '&'].join('') : '';
	
	retrieveSMP();
	retrieveXXX();
	fb = null;
	
	const oldSel = selection.clone();
	try {
		$.getJSON(['/ajquery-xxx/', cmd, p1, 'param3=js/state.json'].join(''), function(data, status) {
			fb = data;
			if (fb.isPlaying == '1' && fb.helper1 == '' || fb.isEnqueueing == '1') {
				retrievestate_schedule(refreshInterval);
			} else {
				fb.playingItem = parseInt(fb.playingItem);
				fb.prevplayedItem = parseInt(fb.prevplayedItem);
				fb.focusedItem = parseInt(fb.focusedItem);
				fb.playlistItemsCount = parseInt(fb.playlistItemsCount);
				fb.playlistItemsPerPage = parseInt(fb.playlistItemsPerPage);
				fb.playlistPage = parseInt(fb.playlistPage);
				fb.playlistPlaying = parseInt(fb.playlistPlaying);
				fb.playlistActive = parseInt(fb.playlistActive);
				if (fb.playlistPage == 0) {fb.playlistPage = 1;}
				if (fb.playlists.length == 0) {	fb.playlists = [{ name: '&nbsp;', count: 0 } ];}
				updateUI();
				finishWork();
			}
			if (bPreserveSel) {
				selection.restore(oldSel);
				updatePlaylist();
			}
		})
		.fail(function() {
			finishWork();
		});
	} catch (e) {finishWork()}
}

function retrieveBrowserState(p1) {
	startWork();
	p1 = p1 || '';
	if (p1.length) {p1 = '&param1=' + p1;}
	try {
		$.getJSON(['/ajquery-xxx/?cmd=Browse', p1, '&param3=js/browser.json'].join(''), function(data, status) {
			br = data;
			updateBrowser();
			retrieveState();
			finishWork();
		})
		.fail(function() {
			finishWork();
		});
	} catch (e) {finishWork();}
}

function retrieveLibraryState(cmd, p1) {
	startWork();
	cmd = cmd || '';
	p1 = Url.encode(p1);
	try {
		$.getJSON(['/ajquery-xxx/?cmd=', cmd, '&param1=', p1, '&param3=js/library.json'].join(''), function(data, status) {
			library = data;
			updateLibrary();
			command();
		})
		.fail(function() {
			finishWork();
		});
	} catch (e) {finishWork();}
}

function positionDialog(dlg,X,Y) {
	let sw = document.documentElement.clientWidth - 20;
	let dw = dlg.dialog('option', 'width');
	if (X + dw > sw) {X = sw - dw;}
	if (X < 0) {X = 0;}
	dlg.dialog('option', 'position', [X, Y]);
}

function searchMediaLibrary(v) {
	command('SearchMediaLibrary', jQuery.trim(v));
}

function secondsToStr(seconds) { // day, h, m and s
	const days = Math.floor(seconds / (24 * 60 * 60));
	seconds -= days * (24 * 60 * 60);
	const hours    = Math.floor(seconds / (60 * 60));
	seconds -= hours * (60 * 60);
	const minutes  = Math.floor(seconds / (60));
	seconds -= minutes * (60);
	seconds = Math.floor(seconds);
	return (days > 0 ? days + (days > 1 ? ' days, ' : ' day, ') : '') + hours + 'h, ' + minutes + 'm';
}

$(function() {
	$(document).ready(function() {
		// Responsive design
		$('body').css('overflow-x','hidden');
		// $('body').css('overflow-y','hidden');
		
		$('*').mousemove(function(e) {
			mouse.x = e.pageX;
			mouse.y = e.pageY;
		}).mouseup(function() {
			if (drag.dragging) {$("#pl div[id*='i']").mouseup();}
			mouse.reset();
			drag.reset();
		}).mousedown(function() {
			mouse.down = true;
			tooltip.hide();
		}); 
		
		//hover states on the static widgets
		$('ul#buttons li:not([id=vol])').hover(
			function() { $(this).addClass('ui-state-hover'); }, 
			function() { $(this).removeClass('ui-state-hover'); }
		);
		
		$('#tabs').tabs({
			selected: -1,
			activate: function(event, ui) { 
				if (!settingTabs) {retrieveState('SwitchPlaylist', $("#tabs").tabs('option','active'));}
			}
		})
		.dblclick(function(e) {
			if (fb) {
				// Rename active playlist
				const ap = fb.playlistActive;
				if (ap !== "-1" && fb.playlists.length) {
					if ($('#tabs').tabs('option', 'active') === ap) {
						const currName = fb.playlists[ap].name;
						const currTabName = e.target.innerHTML;
						if (currTabName === currName) {
							$('#RenamePlaylist').click();
						}
					}
				}
			}
		});

		// Anywhere on playlist slider
		$('#pageslider').slider({
			change: function(event, ui) {
				if (event.originalEvent) {
					tooltip.hide();
					if (fb && fb.playlistPage != ui.value || !fb) {
						retrieveState('P', ui.value);
					}
				}
			},
			slide: function(event,ui) {
				tooltip.show( 'Page ' + ui.value + '/' + (Math.ceil(fb.playlistItemsCount*1.0 / fb.playlistItemsPerPage)), mouse.x + 20 , ($(this).offset().top - 15));
			},
			range: false,
			min: 1,
			max: 1,            
			value: 1
		})
		
		// Only on playlist slider button
		$('#pageslider .ui-slider-handle').dblclick(function(e) {
			$('#FocusOnPlaying').click();
		}).hover(
			function(e) {if (!mouse.down) {tooltip.show('Double click to focus on playing item', mouse.x + 20 , ($(this).offset().top - 15));}},
			function(e) {tooltip.hide();}
		);
		
		$('#SAC').click(function(e) {
			if ($(this).prop('checked')) {command('SAC', '1', void(0), true);}
			else {command('SAC', '0', void(0), true);}
		});
		
		$('#SAQ').click(function(e) {
			if ($(this).prop('checked')) {command('SAQ', '1', void(0), true);}
			else {command('SAQ', '0', void(0), true);}
		});
		
		$('#PBO').change(function(e) {
			command('PlaybackOrder', $(this).prop('selectedIndex'), void(0), true);
		});
		
		// search dialog
		$('#search_dlg').dialog({
			autoOpen: false,
			width: 300,
			close: function(event, ui) { 
				saveWindowToCookie($(this).attr('id'), false);
			},
			open: function(event, ui) {
				saveWindowToCookie($(this).attr('id'), true);
				$('#searchstr').focus();
			},
			resizable : 'n,e,s,w,nw,sw,ne',
		    	dragStop: function(event, ui) {
				saveDialogPositionToCookie($(this).attr('id'), ui)
			},
			resizeStop: function(event,ui) { 
				saveDialogPositionToCookie($(this).attr('id'), ui)
				return true;
			},
			maxWidth: 0.9 * document.documentElement.clientWidth // Responsive design
		});
		
		$('#search_dlg_nav1').insertBefore('#search_dlg');
		$('#search_dlg_nav2').insertBefore('#search_dlg');
		
		$('#searchstr').keypress(function(e) {
			const currSearch = $('#searchstr').val();
			if (e.which == 13) { // Enter
				searchMediaLibrary(currSearch);
			} else {
				if (timeoutId2) {
				  	clearTimeout(timeoutId2);
				  	timeoutId2 = null;
				}
				if (!timeoutId2) {
					timeoutId2 = setTimeout("searchMediaLibrary($('#searchstr').val())", 500);
				}
			}
			const query = library ? library.queryInfo.length : null;
			if (query === null) {return;}
			if (library.queryInfo.length < 1 && currSearch) {$('#r_btn').html('Filter');}
			else if(library.queryInfo.length < 1 && !currSearch) {$('#r_btn').html('Retrieve artist list');}
			else {$('#r_btn').text('<');}
		});
		
		$('#r_btn').click(function(e) {
			$(this).blur();
			const query = $('#searchstr').val().toString();
			if (query && query.length && (!library || library.queryInfo.length === 0)) {retrieveLibraryState('QueryAdvance', query);}
			else {retrieveLibraryState('QueryRetrace');}
		});
		
		// browse dialog
		$('#browse_dlg').dialog({
			autoOpen: false,
			position: ['left', 'top'],
			open: function(event, ui) {
				retrieveBrowserState(); 
				saveWindowToCookie($(this).attr('id'), true);
			},
			buttons: {
				"Browse to..." : function() {
					let path = promptf("Browse to:", Url.decode(br.pathcurrent));
					if (path !== null) {retrieveBrowserState(path);}
				},
				"Enqueue current" : function() { 
					retrieveState(brParams.cmdenqueue);
				},
				"Enqueue nested" : function() { 
					retrieveState(brParams.cmdenqueuenested);
				},
				"Close": function() { 
					$(this).dialog("close"); 
				}
		    },
			close: function(event, ui) { 
				saveWindowToCookie($(this).attr('id'), false);
				brOffsets = {};
			},
			dragStop: function(event, ui) {
				saveDialogPositionToCookie($(this).attr('id'), ui)
			},
			resizeStop: function(event,ui) { 
				saveDialogPositionToCookie($(this).attr('id'), ui)
				return true;
			},
			maxWidth: 0.9 * document.documentElement.clientWidth // Responsive design
		});
		
		$("#browse_dlg_nav").insertBefore("#browse_dlg");
		
		// error dialog
		$('#error_dlg').dialog({
			autoOpen: false,
			modal: true,
			bgiframe: true,
			width: 510
		});
		
		// toolbar buttons
		$('.btncmd').click(function(e) {
			e.preventDefault();
			const id = $(this).attr('id');
			command(id, void(0), void(0), true);
			if (id === 'PlayOrPause') {
				if (fb.isPlaying == '1') {$(this).html('<span class="ui-icon ui-icon-play"></span>');}
				else {$(this).html('<span class="ui-icon ui-icon-pause"></span>');}
			}
		});
		
		$('#mute').click(function(e) {
			command('VolumeMuteToggle', void(0), void(0), true);
		});
		
		// Extended controls
		$('#pbs_btn').click(function(e) {
			if ($('#pbs_dlg').is(':hidden')) {
				setDialogState($('#pbs_dlg'), getValuesFromCookie('pbs_dlg'));
				// Responsive design
				const maxWidth = 0.9 * document.documentElement.clientWidth;
				if ($('#pbs_dlg').dialog('option', 'width') > maxWidth) {
					$('#pbs_dlg').dialog('option', 'width', maxWidth);
				}
				$('#pbs_dlg').dialog('option', 'maxWidth', 0.9 * document.documentElement.clientWidth);
				blinkDialog($('#pbs_dlg'));
				$('#pbs_dlg').dialog('open').dialog('moveToTop');
			} else {
				$('#pbs_dlg').dialog('close');
				saveWindowToCookie('pbs_dlg', false);
			}
		});
		$('#pbs_dlg').dialog({
			autoOpen: false,
			close: function(event, ui) { 
				saveWindowToCookie($(this).attr('id'), false);
			},
			open: function(event, ui) {
				saveWindowToCookie($(this).attr('id'), true);
				$("#PBO").blur();
			},
			dragStop: function(event, ui) {
				saveDialogPositionToCookie($(this).attr('id'), ui)
			},
			resizeStop: function(event,ui) { 
				saveDialogPositionToCookie($(this).attr('id'), ui)
				return true;
			},
			maxWidth: 0.9 * document.documentElement.clientWidth // Responsive design
		});
		
		// Playlist Tools
		$('#pt_btn').click(function(e) {
			if ($('#pt_dlg').is(':hidden')) {
				setDialogState($('#pt_dlg'), getValuesFromCookie('pt_dlg'));
				if ($('#pt_dlg').dialog('option', 'height') === 'auto') {
					$('#pt_dlg').dialog('option', 'height', 800);
					$('#pt_dlg').dialog('option', 'width', 540);
				}
				// Responsive design
				const maxWidth = 0.9 * document.documentElement.clientWidth;
				if ($('#pt_dlg').dialog('option', 'width') > maxWidth) {
					$('#pt_dlg').dialog('option', 'width', maxWidth);
				}
				$('#pt_dlg').dialog('option', 'maxWidth', 0.9 * document.documentElement.clientWidth);
				blinkDialog($('#pt_dlg'));
				$('#pt_dlg').dialog('open').dialog('moveToTop');
			} else {
				$('#pt_dlg').dialog('close');
				saveWindowToCookie('pt_dlg', false);
			}
		});
		$('#pt_dlg').dialog({
			autoOpen: false,
			close: function(event, ui) { 
				saveWindowToCookie($(this).attr('id'), false);
			},
			open: function(event, ui) {
				saveWindowToCookie($(this).attr('id'), true);
				command(void(0), void(0), void(0), true);
				$("#PBO").blur();
			},
			dragStop: function(event, ui) {
				saveDialogPositionToCookie($(this).attr('id'), ui)
			},
			resizeStop: function(event,ui) { 
				saveDialogPositionToCookie($(this).attr('id'), ui)
				return true;
			},
			maxWidth: 0.9 * document.documentElement.clientWidth // Responsive design
		});
		
		// Playlist Manager
		$('#pm_btn').click(function(e) {
			if ($('#pm_dlg').is(':hidden')) {
				setDialogState($('#pm_dlg'), getValuesFromCookie('pm_dlg'));
				if ($('#pm_dlg').dialog('option', 'height') == 'auto') {
					$('#pm_dlg').dialog('option', 'height', 800);
					$('#pm_dlg').dialog('option', 'width', 540);
				}
				// Responsive design
				const maxWidth = 0.9 * document.documentElement.clientWidth;
				if ($('#pm_dlg').dialog('option', 'width') > maxWidth) {
					$('#pm_dlg').dialog('option', 'width', maxWidth);
				}
				$('#pm_dlg').dialog('option', 'maxWidth', 0.9 * document.documentElement.clientWidth);
				blinkDialog($('#pm_dlg'));
				$('#pm_dlg').dialog('open').dialog('moveToTop');
			} else {
				$('#pm_dlg').dialog('close');
				saveWindowToCookie('pm_dlg', false);
			}
		});
		$('#pm_dlg').dialog({
			autoOpen: false,
			close: function(event, ui) { 
				saveWindowToCookie($(this).attr('id'), false);
			},
			open: function(event, ui) {
				saveWindowToCookie($(this).attr('id'), true);
				command(void(0), void(0), void(0), true);
				$("#PBO").blur();
			},
			dragStop: function(event, ui) {
				saveDialogPositionToCookie($(this).attr('id'), ui)
			},
			resizeStop: function(event,ui) { 
				saveDialogPositionToCookie($(this).attr('id'), ui)
				return true;
			},
			maxWidth: 0.9 * document.documentElement.clientWidth // Responsive design
		});
		
		// Console panel
		$('#cl_btn').click(function(e) {
			if ($('#cl_pane').is(':hidden')) {
				let values = getValuesFromCookie('cl_pane');
				if (values[0] === 'auto' || values[1] === 'auto') {
					values[0] = document.documentElement.clientWidth - $('#cl_pane').outerWidth() - 5;
					values[1] = document.documentElement.clientHeight - $('#cl_pane').outerHeight() - 5;
				} 
				if (values[1] > document.documentElement.clientHeight) {
					values[1] = document.documentElement.clientHeight - $('#cl_pane').outerHeight() - 5;
				}
				if (values[0] > document.documentElement.clientWidth) {
					values[0] = document.documentElement.clientWidth - $('#cl_pane').outerWidth() - 5;
				}
				// stupid workaround for firefox
				// if (values[2] !== 'auto') {$('#cl_pane').css({width: values[2]});}
				// if (values[3] !== 'auto') {$('#cl_pane').css({width: values[3]});}
				$('#cl_pane').css({width: '50%'});
				$('#cl_pane').css({position: 'absolute', left: values[0], top: values[1], display: 'inline', visibility: 'visible'});
				updateConsole();
				saveWindowToCookie('cl_pane', true);
			} else {
				$('#cl_pane').hide();
				saveWindowToCookie('cl_pane', false);
			}
		});
		$('#cl_dlg').dialog({
			autoOpen: false,
			close: function(event, ui) { 
				saveWindowToCookie($(this).attr('id'), false);
			},
			open: function(event, ui) {
				saveWindowToCookie($(this).attr('id'), true);
				command();
				$("#PBO").blur();
			},
			dragStop: function(event, ui) {
				saveDialogPositionToCookie($(this).attr('id'), ui)
			},
			resizeStop: function(event,ui) { 
				saveDialogPositionToCookie($(this).attr('id'), ui)
				return true;
			}
		});
		$('#cl_pane').draggable( {stop: function(event, ui) {
			saveDivPositionToCookie('cl_pane');
		}})
		.dblclick(function(e) {
			log.alt = !log.alt;
			updateConsole(log.alt ? log.maxLinesAlt : log.maxLines);
		})
		.hover(
			function(e) {if (!mouse.down) {tooltip.show('Double click to toggle number of lines shown', mouse.x + 20 , ($(this).offset().top - 15));}},
			function(e) {tooltip.hide();}
		);
		
		// Help
		$('#help_btn').click(function(e) {
			if ($('#help_dlg').is(':hidden')) {
				setDialogState($('#help_dlg'), getValuesFromCookie('help_dlg'));
				if ($('#help_dlg').dialog('option', 'height') == 'auto') {
					$('#help_dlg').dialog('option', 'height', 800);
					$('#help_dlg').dialog('option', 'width', 540);
				}
				// Responsive design
				const maxWidth = 0.9 * document.documentElement.clientWidth;
				if ($('#help_dlg').dialog('option', 'width') > maxWidth) {
					$('#help_dlg').dialog('option', 'width', maxWidth);
				}
				$('#help_dlg').dialog('option', 'maxWidth', 0.9 * document.documentElement.clientWidth);
				blinkDialog($('#help_dlg'));
				$('#help_dlg').dialog('open').dialog('moveToTop');
			} else {
				$('#help_dlg').dialog('close');
				saveWindowToCookie('help_dlg', false);
			}
		});
		$('#help_dlg').dialog({
			autoOpen: false,
			close: function(event, ui) { 
				saveWindowToCookie($(this).attr('id'), false);
			},
			open: function(event, ui) {
				saveWindowToCookie($(this).attr('id'), true);
				$("#PBO").blur();
			},
			dragStop: function(event, ui) {
				saveDialogPositionToCookie($(this).attr('id'), ui)
			},
			resizeStop: function(event,ui) { 
				saveDialogPositionToCookie($(this).attr('id'), ui)
				return true;
			},
			maxWidth: 0.9 * document.documentElement.clientWidth // Responsive design
		});
		
		// Search
		$('#search_btn').click(function(e) {
			if ($('#search_dlg').is(':hidden')) {
				setDialogState($('#search_dlg'), getValuesFromCookie('search_dlg'));
				// Responsive design
				const maxWidth = 0.9 * document.documentElement.clientWidth;
				if ($('#search_dlg').dialog('option', 'width') > maxWidth) {
					$('#search_dlg').dialog('option', 'width', maxWidth);
				}
				$('#search_dlg').dialog('option', 'maxWidth', 0.9 * document.documentElement.clientWidth);
				maxWidth: 0.9 * document.documentElement.clientWidth // Responsive design
				blinkDialog($('#search_dlg'));
				$('#search_dlg').dialog('open').dialog('moveToTop');
			} else {
				$('#search_dlg').dialog('close');
				saveWindowToCookie('search_dlg', false);
			}
		});
		
		$('#browse_btn').click(function(e) {
			if ($('#browse_dlg').is(':hidden')) {
				setDialogState($('#browse_dlg'), getValuesFromCookie('browse_dlg'));
				if ($('#browse_dlg').dialog('option', 'height') == 'auto') {
					$('#browse_dlg').dialog('option', 'height', 400);
					$('#browse_dlg').dialog('option', 'width', 500);
				}
				// Responsive design
				const maxWidth = 0.9 * document.documentElement.clientWidth;
				if ($('#browse_dlg').dialog('option', 'width') > maxWidth) {
					$('#browse_dlg').dialog('option', 'width', maxWidth);
				}
				$('#browse_dlg').dialog('option', 'maxWidth', 0.9 * document.documentElement.clientWidth);
				blinkDialog($('#browse_dlg'));
				$('#browse_dlg').dialog('open').dialog('moveToTop');
			} else {
				$('#browse_dlg').dialog('close');
				saveWindowToCookie('browse_dlg', false);
			}
		});
		
		$('#aa_btn').click(function(e) {
			if ($('#aa_pane').is(':hidden')) {
				let values = getValuesFromCookie('aa_pane');
				if (values[0] == 'auto' || values[1] == 'auto') {
					values[0] = document.documentElement.clientWidth - $('#aa_pane').outerWidth() - 5;
					values[1] = 5;
				}
				// stupid workaround for firefox
				if (values[2] != 'auto') {$('#aa_pane').css({width: values[2]});}
				if (values[3] != 'auto') {$('#aa_pane').css({width: values[3]});}
				$('#aa_pane').css( { position: 'absolute', left: values[0], top: values[1], display: 'inline', visibility: 'visible' } );
				updateAlbumart();
				saveWindowToCookie('aa_pane', true);
			} else {
				$('#aa_pane').hide();
				saveWindowToCookie('aa_pane', false);
			}
		});
		
		// album art panel
		$('#aa_pane').draggable( {stop: function(event, ui) {
			saveDivPositionToCookie('aa_pane');
		}})
		.dblclick(function(e) {
			aa.altSize = !aa.altSize;
			const width = aa.altSize ? aa.img.width : aa.img.width / 2;
			const height = aa.altSize ? aa.img.width : aa.img.width / 2;
			$('#aa_pane').css({width, height});
			$('#aa_img').css({width, height});
			if (width > document.documentElement.clientWidth) {$('#aa_btn').click();} // Responsive design
			saveDivPositionToCookie('aa_pane')
		})
		.hover(
			function(e) {if (!mouse.down) {tooltip.show('Double click to toggle artwork size', mouse.x + 20 , (mouse.y - 15));}},
			function(e) {tooltip.hide();}
		);
		
		// playback volume slider
		$('#volume').slider({
			range: false,
			min: 0,
			max: 134,
			value: 134,
			slide: function(event, ui) {
				tooltip.show(volumeFromSlider(ui), mouse.x + 15, $(this).offset().top - 15);
			},
			stop: function(event, ui) {
				volumeFromSlider(ui);
				tooltip.hide();
			}
		});
		// Only on playback volume slider button
		$('#vol .ui-slider-handle').dblclick(function(e) {
			command('VolumeMuteToggle', void(0), void(0), true);
		}).hover(
			function(e) {if (!mouse.down) {tooltip.show('Double click to mute', mouse.x + 20 , ($(this).offset().top - 15));}},
			function(e) {tooltip.hide();}
		);
		
		// Buttons
		$('#CreatePlaylist,#PTCreatePlaylist').click(function(e) {
			let name = promptf('Enter new playlist name:', 'New Playlist');
			if (name != null) {command($(this).attr('id').replace('PT',''), name, void(0), true);}
		});
		
		$('#RemovePlaylist,#PTRemovePlaylist').click(function(e) {
			if (!$(this).hasClass('ui-state-disabled')) {
				if (confirm("Remove \"" + fb.playlists[fb.playlistActive].name + "\" playlist?")) {
					command($(this).attr('id').replace('PT',''), fb.playlistActive);
				}
			}
		});
		
		$('#RenamePlaylist,#PTRenamePlaylist').click(function(e) {
			if (!$(this).hasClass('ui-state-disabled')) {
				let new_name = promptf("Enter new name:", fb.playlists[fb.playlistActive].name);
				if (new_name != null) {command('RenamePlaylist', new_name, fb.playlistActive, true);}
			}
		});
		
		$('#EmptyPlaylist,#PTEmptyPlaylist').click(function(e) {
			if (!$(this).hasClass('ui-state-disabled')) {
				if (confirm("Empty playlist?")) {
					command($(this).attr('id').replace('PT',''));
				}
			}
		});
		
		$('#rel_btn,#RefreshPlaylist,#PTRefreshPlaylist').click(function(e) {
			retrieveState();
			updateConsole();
		});
		
		$('#FlushQueue,#QueueRandomItems').click(function(e) {
			command($(this).attr('id'), void(0), void(0), true);
		});
		
		$('#Undo,#Redo,#PTUndo,#PTRedo').click(function() {
			if (!$(this).hasClass('ui-state-disabled')) {
				command($(this).attr('id').replace('PT',''));
			}
		});
		
		$('#FocusOnPlaying,#PTFocusOnPlaying').click(function() {
			if (!$(this).hasClass('ui-state-disabled')) {
				if (fb.isPlaying == '1' || fb.isPaused == '1') {
					const curr = (fb.playlistPage - 1) * fb.playlistItemsPerPage;
					const next = fb.playlistPage * fb.playlistItemsPerPage;
					// Avoid loosing selection when the current page contains the focused item
					if (fb.playlistActive === fb.playlistPlaying && fb.playingItem >= curr && fb.playingItem <= next) {return;}
					else {
						// Select item
						selection.reset();
						selection.items = {[fb.playingItem] : true};
						selection.calc();
						// And jump to page
						command('FocusOnPlaying', void(0), void(0), true);
					}
				}
			}
		});
		
		$('#Del').click(function() { 
			if (!$(this).hasClass('ui-state-disabled')) {
				let items = selection.toStr();
				command($(this).attr('id').replace('PT',''), items);
			}
		});
		
		$('#QueueItems,#DequeueItems').click(function() { 
			if (!$(this).hasClass('ui-state-disabled')) {
				let items = selection.toStr();
				command($(this).attr('id').replace('PT',''), items, void(0), true);
			}
		});
		
		$('#SetFocus,#PTSetFocus').click(function() { 
			if (!$(this).hasClass('ui-state-disabled')) {
				const items = selection.toStr();
				if (selection.count === 0) {
					return;
				} else if (selection.count === 1) {
					command('SetFocus', items, void(0), true);
				} else {
					command('SetSelection', '', void(0), true);
					command('SetSelection', items, void(0), true);
				}
			}
		});
		
		// Playlist buttons
		$('#prevpage_btn').click(function(e) {
			if (!$(this).hasClass('ui-state-disabled') && fb) {
				e.preventDefault();
				retrieveState('P', fb.playlistPage - 1);
			}
		});
		
		$('#nextpage_btn').click(function(e) {
			if (!$(this).hasClass('ui-state-disabled')) {
				e.preventDefault();
				retrieveState('P', fb.playlistPage + 1);
			}
		});
		
		$('#searchstr,#playlist_name').blur(function() { inputHasFocus = false; }).focus(function() { inputHasFocus = true; });
		
		$('#progressbar').progressbar({
			value: 0
		})                                                             
		.resizable({ alsoResize: '#tabs', handles: 'e', resize: function(event, ui) { savePlaylistSize(); } })
		.hover(
			function(event) { },
			function(event) { tooltip.hide(); })
		.mousemove(
			function(event) {
				if (fb && fb.isPlaying == "1") {
					let t = Math.round((event.pageX - $('#progressbar').offset().left) * fb.itemPlayingLen / ($('#progressbar').width()));
					tooltip.show(formatTime(t), event.pageX + 15, $('#progressbar').offset().top - 10);
				}
		})
		.click(function(event) {
			if (fb && fb.isPlaying == "1") {
				command('Seek', (Math.round((mouse.x - $('#progressbar').offset().left) * 100 / $('#progressbar').width())));
			}
		});
		
		$(window).bind("blur", function() {
			keyPressed = { };
		});
		
		/*
		// Copy / Paste
		$('#Copy').click(function() {
			if (!$(this).hasClass('ui-state-disabled')) {
				const items = selection.toStr();
				command('SelectionCommand', $(this).attr('id'), items);
			}
		}); */
		
		// Input sort menu
		$('#InputSort').click(function(e) {
			let sort = promptf('Enter Sort pattern:\n\'ASCENDING BY\' or \'DESCENDING BY\'\nare allowed at the start (ascending by default).', '%title%');
			if (sort != null) {
				if (sort.startsWith('ASCENDING BY') || sort.startsWith('ABY')) {command('SortAscending', sort);}
				else if (sort.startsWith('DESCENDING BY') || sort.startsWith('DBY')) {command('SortDescending', sort);}
				else if (!sort.startsWith('DESCENDING') && !sort.startsWith('ASCENDING')) {command('SortAscending', sort);}
				else {return;}
			}
		});
		
		// Input contextual menu
		$('#InputCC').click(function(e) {
			let name = promptf('Enter Contextual (full) menu name:\nNote that running playlist-specific commands\nlike Remove, Crop, etc is not possible.', 'Playback Statistics/Rating/5');
			if (name != null) {
				const items = selection.toStr();
				command('SelectionCommand', name , items, true);
			}
		});
		
		// Rating buttons
		$('#R1, #R2, #R3, #R4, #R5, #RPLUS, #RMINUS, #R0').click(function(e) {
			if (!$(this).hasClass('ui-state-disabled') && fb) {
				const items = selection.toStr();
				const id = $(this).attr('id').replace('R','');
				const menu = (id === '0' ? '<not set>' : (id === 'PLUS' ? '+' : (id === 'MINUS' ? '-' : id)));
				command('SelectionCommand', 'Playback Statistics/Rating/' + menu , items, true);
			}
		});
		// Custom contextual menus
		$('[id^=CC]').click(function() { // CC*
			if (!$(this).hasClass('ui-state-disabled')) {
				const idx = $(this).attr('id').replace('CC','') - 1;
				if (xxx.contextMenus && xxx.contextMenus.length > idx) {
					const items = selection.toStr();
					const menu = xxx.contextMenus[idx].menu;
					command('SelectionCommand', menu, items);
					if (menu.indexOf('Youtube') !== -1) {setTimeout('command();', 1500);}
				}
			}
		});
		// Playlist Tools
		$('[id^=PTSMP]').click(function() { // PTSMP*
			if (!$(this).hasClass('ui-state-disabled')) {
				if (!smp.config.bRunCmd) {return;}
				const panelKeys = Object.keys(smp.playlistToolsEntriesCMD);
				if (!panelKeys.length) {return;}
				const panelKey = panelKeys[0]; // Only use first one
				const idx = $(this).attr('id').replace('PTSMP','');
				const currMenu = smp.smpMenus[idx - 1];
				command('CmdLine', '/run_main:"File/Spider Monkey Panel/Script commands/' + panelKey + '/' + currMenu.name + '"');
			}
		});
		
		$('#PTME').change(function(e) {
			if (!smp.config.bRunCmd) {return;}
			const data = smp.playlistToolsEntries[$(this).prop('selectedIndex') - 1].name; // Index has an offset due to the first entry being a dummy entry...
			const idxListener = fb.playlists.findIndex((pls) => {return pls.name === 'pt:listener';});
			const currPls = fb.playlistActive;
			if (idxListener === -1) {
				command('CreatePlaylist', 'pt:listener', currPls + 1);
				command('SwitchPlaylist', currPls + 1);
			} else if (currPls !== idxListener) {
				command('SwitchPlaylist', idxListener);
			}
			command('CmdLine', '/add "command_'+ data + '"');
			setTimeout('command();', 1500);
		});
		
		$('#PTMECMD').change(function(e) {
			if (!smp.config.bRunCmd) {return;}
			const panelKeys = Object.keys(smp.playlistToolsEntriesCMD);
			if (!panelKeys.length) {return;}
			const panelKey = panelKeys[0]; // Only use first one
			const data = smp.playlistToolsEntriesCMD[panelKey][$(this).prop('selectedIndex') - 1].name; // Index has an offset due to the first entry being a dummy entry...
			command('CmdLine', '/run_main:"File/Spider Monkey Panel/Script commands/' + panelKey + '/' + data + '"');
			setTimeout('command();', 1500);
		});
		
		$('#PTOD').change(function(e) {
			if (!smp.config.bRunCmd) {return;}
			const data = smp.devices[$(this).prop('selectedIndex')].name;
			command('CmdLine', '/run_main:"Playback/Device/' + data, void(0), void(0), true);
			smp.devices.forEach((_) => {_.active = false;});
			smp.devices[$(this).prop('selectedIndex')].active = true;
			setTimeout('command();', 1500);
		});
		
		$('#PTDSP').change(function(e) {
			if (!smp.config.bRunCmd) {return;}
			const data = smp.dsp[$(this).prop('selectedIndex')].name;
			command('CmdLine', '/run_main:"Playback/DSP settings/' + data, void(0), void(0), true);
			smp.dsp.forEach((_) => {_.active = false;});
			smp.dsp[$(this).prop('selectedIndex')].active = true;
			setTimeout('command();', 1500);
		});
		
		// Playlist Manager
		$('[id^=PMME]').change(function(e) { // PMME*
			if (!smp.config.bRunCmd) {return;}
			const menu = menusPls.find((menu) => {return menu.id === $(this).prop('id');}); // menuPpls at header
			const menuType = menu.type;
			const data = smp.playlistManagerEntries[menuType][$(this).prop('selectedIndex') - 1].name; // Index has an offset due to the first entry being a dummy entry...
			if (menu.bSelection) {
				const items = selection.toStr();
				const oldSel = selection.clone();
				command('SetSelection', '', void(0), true);
				command('SetSelection', items, void(0), true);
			}
			command('CmdLine', '/run_main:"File/Spider Monkey Panel/Script commands/' + data, void(0), true);
			$(this).prop('selectedIndex', 0); // Just in case something fails...
		});
		
		$(document).ajaxError(function(event, XMLHttpRequest, settings, thrownError) {
			if(event.type == 'ajaxError') {
				// Don't throw window errors for json/log when file is missing
				if (XMLHttpRequest.statusText === 'Not Found' && (settings.url.endsWith('.json') || settings.url.endsWith('.log')))  {console.log('File import: ' + settings.url + ' ' + XMLHttpRequest.statusText); return;}
				let rep = '';
				// The rest
				if (fb) {
					rep += 'settings.url: ' + settings.url + '\n\n';
					rep += 'XMLHttpRequest.responseText: \n' + XMLHttpRequest.responseText + '\n\n';
					rep += 'XMLHttpRequest.statusText: ' + XMLHttpRequest.statusText;
				} else {
					rep += 'settings.url: ' + settings.url + '\n\n';
					rep += 'foobar2000 server connection is not working. Possible reasons:\n'
					rep += '\t- Network errors.\n';
					rep += '\t- Unreachable or stopped server.\n'
					rep += '\t- foobar2000 crash.\n'
					rep += '\n\nConnection will be retried every 10 secs (dialog will be automatically closed on success).';
				}
				$('#dbg').html(rep);
				$('#error_dlg').dialog('open');
			}
		});
		
		$('#summary').dblclick(function(e) {
			$('#FocusOnPlaying').click();
		}).hover(
			function(e) {if (!mouse.down) {tooltip.show('Double click to focus on playing item', mouse.x + 20 , ($(this).offset().top - 15));}},
			function(e) {tooltip.hide();}
		);
		
		document.onkeydown = function(evt) { keyDown(evt? evt.keyCode : event.keyCode); }
		document.onkeyup = function(evt) { keyUp(evt? evt.keyCode : event.keyCode); }
		
		retrieveState();
		reopenWindows();
		restorePlaylistSize();
		// Try again if foobar2000 has not started yet or there was a crash
		setTimeout(() => {
			let bCrashed = false;
			const refresh = () => {
				setTimeout(() => {
					retrievestate_schedule(500, "RefreshPlayingInfo");
					refresh();
					if (!fb) {bCrashed = true;}
					else {
						if (bCrashed && $('#error_dlg').dialog('isOpen')) {
							$('#error_dlg').dialog('close');
						}
						bCrashed = false;
					}
				}, 10000);
			};
			refresh();
		}, 1000);
	});
});