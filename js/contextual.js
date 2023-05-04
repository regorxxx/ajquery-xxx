'use strict';﻿﻿﻿
//04/05/23

function menu(id) {
	this.id = id;
	this.html = document.getElementById(id);
	this.draw = (x, y) => {
		this.html.style.top = y + 'px';
		this.html.style.left = x + 'px';
		this.html.style.visibility = 'visible';
		this.html.style.opacity = '1';
		this.checkFlags();
	};
	this.flags = {};
	this.checkFlags = () => {
		for (let option in this.flags) {
			if (!this.flags[option]()) {
				$('[id=' + option+ ']').attr('style', 'color: darkgray;');
			} else {
				$('[id=' + option+ ']').attr('style', null);
			}
		}
	}
	this.functions = {};
	this.onClick = (option) => {
		if (this.track(option)) {
			this.functions[option]();
		} else {alert(option + ' does not exist.');}
	}
	this.track = (option) => {
		return this.functions.hasOwnProperty(option);
	}
}

const ctxMenu = new menu('ctxMenu');
ctxMenu.functions.ctxMenuDelete = () => $('#Del').click();
ctxMenu.flags.ctxMenuDelete = () => fb.isLocked != '1' && selection.count;
ctxMenu.functions.ctxMenuUndo = () => $('#Undo').click();
ctxMenu.flags.ctxMenuUndo = () => fb.isUndoAvailable == '1';
ctxMenu.functions.ctxMenuRedo = () => $('#Redo').click();
ctxMenu.flags.ctxMenuRedo = () => fb.isRedoAvailable == '1';

if (document.addEventListener) {
	document.addEventListener('contextmenu', function(e) {
		const posX = e.clientX;
		const posY = e.clientY;
		const atContext = $(e.target);
		switch (true) {
			case atContext.parents('[id=playlist]').attr('id') === 'playlist': ctxMenu.draw(posX, posY); break;
			default: break;
		}
		e.preventDefault();
		return false;
	}, false);

	document.addEventListener('click', function(e) {
		if (e.button === 0) { // Left click only
			ctxMenu.html.style.opacity = "0";
			const option = $(e.target).context.id;
			if (ctxMenu.track(option)) {ctxMenu.onClick(option);}
			setTimeout(function() {
				ctxMenu.html.style.visibility = "hidden";
			}, 501);
		}
	}, false);
} else { // ie
	document.attachEvent('oncontextmenu', function(e) {
		const posX = e.clientX;
		const posY = e.clientY;
		const atContext = $(e.target);
		switch (true) {
			case atContext.parents('[id=playlist]').attr('id') === 'playlist': ctxMenu.draw(posX, posY); break;
		}
		e.preventDefault();
		return false;
	});
	document.attachEvent('onclick', function(e) {
		ctxMenu.html.style.opacity = "0";
		const option = $(e.target).context.id;
		if (ctxMenu.track(option)) {ctxMenu.onClick(option);}
		setTimeout(function() {
			ctxMenu.html.style.visibility = "hidden";
		}, 501);
	});
}