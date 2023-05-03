Asynchronious foo_httpcontrol template
0.93 http://code.google.com/p/foo-httpcontrol/

*** Requirements

	This template is developed to be used in modern desktop browsers and 
	is fully compatible with Opera 10, Google Chrome 4 and Firefox 3.5.
	Internet Exploder 8 seems to work as well.

	Some other browsers might also work, but you never know until you try.

	foobar2000 1.4+ and foo_httpcontrol 0.97.24.

	Spider Monkey Panel (SMP) is not required but strongly recommended to get
	some advanced features working (allows running SMP menus via cmd).
	https://theqwertiest.github.io/foo_spider_monkey_panel/

	Playlist Tools (along SMP) is not required but strongly recommended  to fully
	integrate SMP with the online controller, get Ouput Device, DSP, menu entries,
	dynamic button generation and allow Playlist Tools macros and tools to be used.
	https://regorxxx.github.io/foobar2000-SMP.github.io/
	
	Playlist Manager (along SMP) is not required but strongly recommended  to be 
	able to manage playlists -as files- without cluttering the UI with tabs.
	https://regorxxx.github.io/foobar2000-SMP.github.io/

	Run Command (foo_runcmd) is not required but strongly recommended to get
	some advanced features working (allows running statically created menus via cmd).
	It should be built-in on foobar2000 1.5+ installations.
	
	Run Main (foo_run_main) is not required but strongly recommended to get
	some advanced features working (allows running dynamically created menus via cmd).
	https://marc2k3.github.io/run-main/
	
	Youtube component (foo_youtube) is not required but recommended to get
	used along the new contextual menu buttons (the default buttons use it, but you can
	change it to anything you want). (*) As is, allows to look for tracks by same artist, 
	tracks where the artist is featured, instrumental or cover versions.
	https://fy.3dyd.com/home/
	
	Quickseatch UI element (foo_quicksearch) is not required but recommended to get
	used along the new contextual menu buttons (the default buttons use it, but you can
	change it to anything you want). (**) As is, allows to look for tracks by same title, 
	artist, genre or style. Note the 'search' patterns are totally configurable, so you
	can tweak them to do anything you want (like a "dynamic query" applied according to
	selection). Playlist Tools has a more advanced version of that feature -dynamic queries-.
	https://www.foobar2000.org/components/view/foo_quicksearch

	(*) At 'Preferences/Youtube Source/Search' playlist behavior, destination, tags, 
	number of tracks, etc. can be fully configured. Properly configured, can be used
	to merge tracks from library and results from youtube, replacing completely the need
	to use foobar independently. And all can be managed from the controller.

	(**) At Preferences/Media Library/Quicksearch', checking 'Set focus to search results'
	will allow the server to automatically show the new playlist on the controller. 
	Playlist name for those searches can be set too and even append the query to the name.

*** Installation

	Extract archive contents retaining directory structure into %YOUR_FOOBAR_PROFILE_PATH%
	For ex: mine is c:\Users\xxx\AppData\Roaming\foo_httpcontrol_data\ajquery-xxx\...
	For portable installations >= 1.6: .\foobar2000\profile\foo_httpcontrol_data\ajquery-xxx\... 
	For portable installations <= 1.5: .\foobar2000\foo_httpcontrol_data\ajquery-xxx\... 

*** Usage

	Open http://127.0.0.1:8888/ajquery-xxx/index.html in your browser.
	(Note that IP address and port is configuration specific and may
	be different in your case.)

	The interface should be intuitive enough as it is by itself, except:

	1. Double clicking playlist item starts playback.

	2. Single clicking playlist item selects item(s):
		2.1. Clicking on album name selects contiguous tracks from album.
		2.2. Clicking + shift on album name selects multiple albums.
		2.3. Clicking on track name selects the track.
		2.3. Clicking + shift on track name selects in between track(s).
		2.3. Clicking + control on track name adds track to selection.

	3. Double clicking on status bar sets focus on playing item.

	4. Dragging playlist item or selection moves it within the current
	playlist page.
	
	5. Playlist slider is working as playlist page switcher, drag its
	thumb to change page.

	6. A few hotkeys are available (check command buttons tooltips for
	hotkey values).

	8. Use Shift+PageUp and Shift+PageDown to resize playlist.

	It is recommended to enable "Cursor follows playback" option in 
	foobar2000 Playback menu for more convenient playlists browsing.

	You are free to change template parameters by editing ajquery-xxx/config
	file. For example, playlist_items_per_page variable is useful when you
	want to permanently modify playlist page size.
	
	It's also recommended to uncheck 'Log access to console' at
	'Preferences/Tools/Http Control' on foobar (to not pollute console).
	
*** Updates over old ajquery controller

	This is a non-extensive list of main changes done to the controller:
		- Tile, artist, album tags are cut at display to soft-force one track per row.
		- General tweaks to UI placement, space usage and fonts (larger).
		- Rating is now shown on the playlist list for every item (stars).
		- Themes: dark/light. (new themes may be easily added editing the html)
		- Default 20 items per page.
		- Artwork: non-playing and non-artwork found images are now animations.
		- Extended controls reworked: rating and Custom contextual menu Buttons.
		- Playlist Tools: Spider Monkey Menus, Output Devide & DSP selection.
		- Integration with Spider Monkey Panel and Playlist Tools (SMP script).
		- Dynamic icons, menus, tooltips and component checking via SMP.
		- Toggleable log panel (usually used to display console log from foobar).

*** Theme

	Dark or light themes can be set at 'xxx\config-theme.json'. Dark is the default.
	Don't forget to also change default artwork images to at 'img\...' to their dark
	background counterparts! To do that set the http control config file ('config'):
		- albumart_not_found=ajquery-xxx/vinyl-playing-dark.gif
		- albumart_not_available=ajquery-xxx/vinyl-dark.gif
		
	Alternatively you can run '_switchTheme.bat' to process all required changes at once.
	
*** Dynamic color theme

	There is also an option to completely change the player colors based on album art,
	similar to [Georgia-ReBORN](https://github.com/TT-ReBORN/Georgia-ReBORN). It's enabled 
	by default. In case the artwork is hidden or playback stopped, theme fallbacks to the 
	light/dark setting.
	
	Option may be set at 'xxx\config-theme.json'.

*** Console log

	The panel displays the last 10 lines of log file present on this location: '.xxx\console.log'

	It may be used to display any relevant info from the server, either by a third party
	component (foo_np_simple, Spider Monkey Panel, etc.) or the foobar console itself.
	
	To save the console to a file use 'View/Console' and check 'Write Log' at bottom and use
	the previous path. Note this option gets unchecked on every foobar startup (so it's more 
	useful on 24/7 severs). It's also recommended to uncheck 'Log access to console' at
	'Preferences/Tools/Http Control' on foobar (to not pollute console).

*** Extended Controls (advanced features)

	This window has general tools for playlist/track management, among them you will find:
		- Run CMD: Run an arbitrary contextual menu on selection.
		- Rating: from 1-5, +, - and reset for the current selection.
		- Custom contextual menu Buttons: pre-defined tools associated to tracks context menu. 
		Can be set at 'xxx\config-contextmenus.json', from menu, to description, icon, ... (*) (**)
	
	(*)	When Playlist Tools (Spider Monkey Panel script) is installed, component checking is
	also allowed. i.e. 'smp\components.json' is automatically updated according to foobar
	config, therefore Contextual menu Buttons are enabled/disabled according to the components
	installed. Examples can be found at 'smp\defaults' folder
	
	(**) The default contextual buttons make use of foo_quicksearch along title, artist and genre
	queries. Style is not a query provided by default when you install the component but it can be
	added with this data: name: Style, query: %style%, context menu: checked (then press add)

*** Playlist Tools (advanced features)

	When Playlist Tools (Spider Monkey Panel script) is installed on foobar server,
	menu entries, output devices and DSP list will be available (*): 
		- Playlist Tools menu entries: disabled unless the associated menus is also
		enabled at 'Script integration\SMP Main menu'.
		- Output Device: disabled unless the associated menus is also
		enabled at 'Script integration\SMP Main menu' OR 'foo_runcmd' and 'foo_run_main'
		are both installed. When the latter happens, CMD method will be always preferred.
		- DSP List: disabled unless the associated menus is also
		enabled at 'Script integration\SMP Main menu' OR 'foo_runcmd' and 'foo_run_main'
		are both installed. When the latter happens, CMD method will be always preferred (*).

	When using Playlist Tools method, and 'Script integration\SMP Main menu' relevant config 
	is set, then you can change the Output Device or the current DSP on server by selecting 
	the desired entry on the drop-down list and calling the associated menu button. (****)
	Only one device/dsp can be set at the same time (the playlist used to send the command will 
	be cleared every time you set a different selection) List is also cleared after command execution.

	Playlist Tools menu entries work the same, but they allow multiple commands execution. 
	Everytime a menu entry is selected, the command is added to the server list. (****)
	Clicking on  the associated menu button executes the entire list and clears it.
	
	(*) The panel is the one sending those lists to the server. Whether you enable or not
	the rest of the features, so it's a 'requirement' to see the actual devices or DSPs on
	the controller on real time. There is a 'workaround' if you don't use SMP and/or Playlist Tools
	though: you can manually edit 'smp\dsp.json' and 'devices.json' according to your PC config.
	Examples can be found at 'smp\defaults' folder.
	
	(**) CMD method just uses simple command line to send the commands. Since it's cleaner
	(no playlist involved), it's preferred whenever it's possible. Obviously, it doesn't work
	for anything outside standard foobar main menus... so its usage is limited to those cases.

	SMP buttons always work, whether you have Playlist Tools installed or not. But without the
	panel they miss a lot of functionality:
		- Icons are dynamically set according to the menu type.
		- Show if menu is enabled (custom icon or check circle) or disabled (crossed circle) (***).
		- Tooltip showing menu name, function name and description if available.

	(***) Therefore, without Playlist Tools, the icons always show a crossed circle, since the server has
	no way to check if the menus are enabled or not. SMP Buttons data can be manually added/edited at
	'smp\smpmenus.json' as workaround for servers without Playlist Tools. 
	Examples can be found at 'smp\defaults' folder.
	
	(****) IT'S MANDATORY TO DISABLE 'ALWAYS SEND NEW FILES TO PLAYIST' 'AT PREFERENCES/SHELL INTEGRATION', 
	¡otherwise the commands will be sent to the wrong playlist!. See 'img\_doc\always_send_new_files.jpg' image.

*** Release history 2023
	04 May  0.95
		add:	Template version is now shown on the help button and dialog window title.
		cha:	Colors will change based on album art palette when the album art is shown, 
				similar to [Georgia-ReBORN](https://github.com/TT-ReBORN/Georgia-ReBORN). Option 
				may be set at 'xxx\config-theme.json', enabled by default.
		cha:	Dark theme is now the default theme.
		cha:	Cursor no longer changes while connection is re-checked (loading indicator).
		cha:	Rating and track length are now split into 2 columns, so they always get aligned
				properly no matter the number of digits (for ex. 10:23 vs 3:20).
		cha:	Code cleanup;
		fix:	Playlist Tools menu entries (listener) not sending commands to proper playlist
				if 'PT:listener' did not exist before (i.e. working on second command sent not the
				first one);
		fix:	Window height increasing indefinitely when showing artwork due to server re-connection
				added on v0.94;

	07 March  0.94
		add:	Template will try to reconnect when server is unreachable every 10 secs;
		add:	Template will check server connection every 10 secs (and adjust UI accordingly);
		cha:	Improved AJAX errors dialog popups;
		fix:	Play/pause icon is now properly set on init (according to foobar playing state);
				
	05 March  0.93
		add:	Playlist locks are now shown on the status bar (requires foo_httpcontrol v0.97.24);
		fix:	Some actions not working properly due to type mismatch (for ex. switching playlists);
		fix:	Infinite loading cursor when console log file was not found;
		fix:	Preemptive workaround for infinite loading when commands or file reading are not 
				executed properly in any case (may happen on foobar crash);

*** Release history 2022
	14 Sept  0.92
		fix:	All Playlist Tools and Manager lists get now refreshed when entries are deleted;
		fix:	All CMD actions are now disabled (UI and functionality) when missing dependencies;
		fix:	Wrapped all JSON reads on try/catch;
		fix:	Minor code fixes and code cleanup;

	28 Aug  0.91
		add:	Double clicking on status bar (below playlist) sets focus on playing item;
		cha:	Playlist Tools integration using dynamic menus;
		cha:	Updated all help texts about Playlist Tools integration;
		fix:	Minor code fixes;

	25 Jun  0.90
		add:	File browser now has header columns;
		add:	Double clicking on active playlist opens rename popup;
		add:	Double clicking on Console log panel alternates between 2 modes;
		add:	Double clicking on Artwork alternates between 2 sizes;
		add:	Double clicking on volume slider mutes the sound (mute button);
		add:	Help button;
		add:	Full documentation within browser;
		add:	Playlist Manager button;
		add:	Playlist Manager integration: available file list, load / save, actions, etc.;
		cha:	Full responsive design, should adapt and fully work on any device;
		cha:	Cursor changes while controller is being reloaded;
		cha:	Cursor for playlist items;
		cha:	Cursor for playlist page slider;
		cha:	Cursor for volume slider;
		cha:	All popup windows are now closed when pressing their button a second time;
		cha:	Minor adjustments to UI colors: album name, playing item, backgrounds...;
		cha:	Minor adjustments to themes;
		cha:	Minor adjustments to browser UI;
		cha:	Minor adjustments to progress bar;
		cha:	Added and edited multiple tooltips;
		cha:	A lot of code cleanup;
		cha:	Text on tabs is now non-selectable;
		cha:	Text on most panels is now non-selectable;
		cha:	Library list can now be filtered with the search input (usually by artist);
		cha:	Removed play button. Replaced with smart play/pause button;
		cha:	Up/down keys allow to select items (+ shift allowed);
		cha:	Icon for selected items;
		fix:	Search panel now has a max height and a scroll bar (instead of infinite size)
		fix:	Text on playlist is now non-selectable (fixes shift + selection not working properly);
		fix:	Text on progress bar is now non-selectable (fixes seeking not working properly);
		fix:	Broken seeking (since original ajquery);
		fix:	Double clicking on playlist page slider to focus on now playing limited to button;
		fix:	Double clicking on a playlist row now works the same on the title or album;
		fix:	Focusing on now playing item jumps to page only when needed;
		fix:	Focusing on now playing item will also mark the item as selected;
		fix:	Selection is not lost when clicking on buttons, opening panels or running most actions;
		fix:	Active playlist tab cursor was not consistent with the rest of tabs;
		fix:	Console log panel position is now limited to window width and height;
		fix:	Loading indicator showing white background on dark theme;

*** Release history 2021
	25 Jun  0.80
		add:	Development continued to be compatible with Spider Monkey Panel scripts;
		add:	Playlist Tools integration:
				- Call pre-configured menu entries with buttons
				- Call arbitrary menu entries by name (retrieves list from foobar first)
				- Set DSP (retrieves list from foobar first)
				- Set Device (retrieves list from foobar first);
		add:	SMP main menu integration;
		add:	Contextual menu Buttons;
		add:	Themes (and associated art);
		add:	Console log panel;
		add:	Rating on playlist list (stars);
		cha:	General UI changes and font size;
		cha:	Artwork images (no playing / no artwork);
		cha:	Row tags are now cut to not overextend over multiple lines;

*** Release history 2015
	31 Dec  0.73
		fix:	broken remove playlist;

*** Release history 2014
	26 Jul  0.72
		add:	autofocus input on search window open;
		fix:	broken media library search;

	02 Mar  0.71
		add:	Second precision seeking (instead of percent), requires 
			foo_httpcontrol 0.97.15;
		fix:	updated to latest jQuery;

	02 Mar  0.70
		fix:	Wrong handling of parent button in file browser;
		fix:	Playback order drop down-box didn't reflect the actual order;

*** Release history 2012
	10 Nov  0.69
		fix:	added a bit of sanity to file browser dialog: list scroll
		        position is remembered for each visited directory, 
		        improved path navigation;
		fix:	added a bit of sanity to search dialog;
		fix:	fixed SAC & SAQ checkboxes behaviour;
		fix:	albumart initialisation;
		fix:	updated jquery & jquery-ui;

	23 Aug  0.68
		add:	playlist page switch buttons;
		fix:	playlist auto width;

*** Release history 2011
	09 Apr 0.67
		add:	double clicking playlist switcher focuses now playing item;
		add:	removed search button;
		fix:	wrong now playing info when playing first track;

	16 Mar 0.66
		fix:	updated jquery & jquery-ui;
		fix:	updated cover art and favicon to match current fb2k theme;
		fix:	seekbar popup vertical position made constant;

	27 Jan 0.65
		fix:	replaced Shift+[ / Shift+] hotkeys with Shift+PageUp / Shift+PageDown due to international keyboards differences;
		fix:	probably got rid of windows moving along with playlist resize;
		fix:	queue total time / selection total time;

*** Release history 2010
	03 May 0.64
		fix:	extra formats in file browser grayed out;
		fix:	queue total time;
		fix:	weird behaviour with zero playlists;
		fix:	ctrl/shift+click selection behaviour;

	17 Apr 0.63
		add:	shift+[ and shift] resizes playlist height;
		add:	show selection total time;
		add:	clicking album title selects whole album;
		fix:	resize playlist width by dragging right side of seekbar;
		fix:	prefomance improvements;

	10 Apr 0.62
		add:	Internet Exploder 8 compatibility;

	30 Mar 0.61
		fix:	some troubles and bugs;

	27 Mar 0.60
		add:	improved playlist drag & drop;
		add:	some fixes and improvements;
		add:	migrated to latest jquery/jquery ui;

	21 Mar 0.59	
		add:	numerous usability improvements;

	17 Mar 0.58
		add:	"Browse to..." in browser window;
		fix:	Remove playlist always removed first one;

	15 Mar 0.57
		add:	reworked playlist items operation style (selecting and
			applying some commands on selection is possible now,
			along with moving selection within the current
			playlist page) - vakata, thanks for the inspiration!;
		add:	a few hotkeys (check command buttons tooltip for
			hotkey values);
		fix:	non-playable files disappeared in browser;
		fix:	excessive size of non-initialized browser window;

	06 Mar 0.56a
		fix:	logarithmic volume control;
		fix:	excessive size of browser window;

	22 Feb 0.56
		add:	logarithmic volume control;
		add:	mute/unmute button;

	23 Jan 0.55
		fix:	incorrect display of xml special chars in page title;
		fix:	fixes and improvements;
		add:	ability to focus on playing item;

	06 Jan 0.54b
		fix:	missing albumart in Firefox;

	06 Jan 0.54a
		fix:	replaced [HELPERN] with [HELPERNX];
		add:	foo_httpcontrol 0.96.3 or newer is required;

	05 Jan 0.54
		fix:	data retrieval timeouts;
		add:	right mouse button click brings up playlist/playlist items popup menus in Chrome/Firefox etc;
		add:	remembering windows position, size and state between sessions (browser cookies must be enabled);

*** Release history 2009
	29 Dec 0.53
		fix: various fixes and improvements;
		add: proper playlist undo/redo support;

	01 Nov 0.52
		fix: various fixes;

	14 Sep 0.51
		add: queue album to playlist popup menu;
		add: flush queue and queue random to playlists popup menu;
		add: auto install feature;

	06 Sep 0.5
		fix: progressbar behaviour in paused state;
		add: resizeable album art;

	03 Sep 0.4
		fix: couldn't perform action on 1st track;

	02 Sep 0.3
		add: usability improvements;
		add: debug info on ajax failure;

	01 Sep 0.2 
		add: playlist operations menu, ctrl+lmb on playlist tab name;
		fix: various fixes;
		
	30 Aug 0.1 Initial release;
