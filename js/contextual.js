'use strict';
//11/06/24

function Menu(id, timeout = 0) {
	this.id = id;
	this.timeout = timeout;
	this.html = document.getElementById(id);
	this.draw = (x, y, ms = this.timeout) => {
		if (ms !== 0) { setTimeout(() => this.draw(x, y, null), ms); }
		else {
			this.html.style.top = y + 'px';
			this.html.style.left = x + 'px';
			this.html.style.visibility = 'visible';
			this.html.style.opacity = '1';
			this.checkFlags();
		}
	};
	this.flags = {};
	this.checkFlags = () => {
		for (let option in this.flags) {
			const entry = $('[id=' + option + ']');
			if (!this.flags[option]()) {
				entry.attr('style', 'color: darkgray;');
			} else {
				entry[0].style.removeProperty('color');
			}
		}
	}
	this.functions = {};
	this.onClick = (option) => {
		if (this.track(option)) {
			this.functions[option]();
		} else { alert(option + ' does not exist.'); }
	}
	this.track = (option) => {
		return this.functions.hasOwnProperty(option);
	}
}

const ctxMenu = new Menu('ctxMenu');
ctxMenu.functions.ctxMenuDelete = () => $('#Del').click();
ctxMenu.flags.ctxMenuDelete = () => fb.isLocked != '1' && selection.count;
ctxMenu.functions.ctxMenuQueue = () => $('#QueueItems').click();
ctxMenu.flags.ctxMenuQueue = () => selection.count;
ctxMenu.functions.ctxMenuDequeue = () => $('#DequeueItems').click();
ctxMenu.flags.ctxMenuDequeue = () => selection.count;
ctxMenu.functions.ctxMenuUndo = () => $('#Undo').click();
ctxMenu.flags.ctxMenuUndo = () => fb.isUndoAvailable == '1';
ctxMenu.functions.ctxMenuRedo = () => $('#Redo').click();
ctxMenu.flags.ctxMenuRedo = () => fb.isRedoAvailable == '1';

const plsMenu = new Menu('plsMenu', 300);
plsMenu.functions.plsMenuRename = () => $('#RenamePlaylist').click();
plsMenu.flags.plsMenuRename = () => {
	const ap = fb.playlistActive;
	return ap !== "-1" && fb.playlists.length && $('#tabs').tabs('option', 'active') === ap;
}
plsMenu.functions.plsMenuRemove = () => $('#RemovePlaylist').click();
plsMenu.flags.plsMenuRemove = () => {
	const ap = fb.playlistActive;;
	return ap !== "-1" && fb.playlists.length && $('#tabs').tabs('option', 'active') === ap;
}
plsMenu.functions.plsMenuNew = () => $('#CreatePlaylist').click();

if (document.addEventListener) {
	document.addEventListener('contextmenu', function (e) {
		const posX = e.clientX;
		const posY = e.clientY;
		const atContext = $(e.target);
		const menus = [ctxMenu, plsMenu];
		let menu;
		switch (true) {
			case atContext.parents('[id=playlist]').attr('id') === 'playlist': menu = ctxMenu; break;
			case atContext[0].classList.contains('ui-tabs-nav') || atContext.parents('.ui-tabs-nav').length !== 0: menu = plsMenu; break;
			default: break;
		}
		if (menu) {
			menu.draw(posX, posY);
			menus.forEach((m) => {
				if (m !== menu) {
					m.html.style.visibility = "hidden";
				}
			});
		}
		e.preventDefault();
		return false;
	}, false);

	document.addEventListener('click', function (e) {
		if (e.button === 0) { // Left click only
			ctxMenu.html.style.opacity = "0";
			plsMenu.html.style.opacity = "0";
			const option = $(e.target).context.id;
			const menus = [ctxMenu, plsMenu];
			menus.forEach((menu) => {
				if (menu.track(option)) { menu.onClick(option); }
			});
			setTimeout(function () {
				menus.forEach((menu) => {
					menu.html.style.visibility = "hidden";
				});
			}, 501);
		}
	}, false);
} else { // ie
	document.attachEvent('oncontextmenu', function (e) {
		const posX = e.clientX;
		const posY = e.clientY;
		const atContext = $(e.target);
		const menus = [ctxMenu, plsMenu];
		let menu;
		switch (true) {
			case atContext.parents('[id=playlist]').attr('id') === 'playlist': menu = ctxMenu; break;
			case atContext[0].classList.contains('ui-tabs-nav') || atContext.parents('.ui-tabs-nav').length !== 0: menu = plsMenu; break;
			default: break;
		}
		if (menu) {
			menu.draw(posX, posY);
			menus.forEach((m) => {
				if (m !== menu) {
					m.html.style.visibility = "hidden";
				}
			});
		}
		e.preventDefault();
		return false;
	});
	document.attachEvent('onclick', function (e) {
		ctxMenu.html.style.opacity = "0";
		plsMenu.html.style.opacity = "0";
		const option = $(e.target).context.id;
		const menus = [ctxMenu, plsMenu];
		menus.forEach((menu) => {
			if (menu.track(option)) { menu.onClick(option); }
		});
		setTimeout(function () {
			menus.forEach((menu) => {
				menu.html.style.visibility = "hidden";
			});
		}, 501);
	});
}