# ajquery-xxx
[![version][version_badge]][changelog]
[![CodeFactor][codefactor_badge]](https://www.codefactor.io/repository/github/regorxxx/ajquery-xxx/overview/main)
[![CodacyBadge][codacy_badge]](https://www.codacy.com/gh/regorxxx/ajquery-xxx/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=regorxxx/ajquery-xxx&amp;utm_campaign=Badge_Grade)
![GitHub](https://img.shields.io/github/license/regorxxx/ajquery-xxx)  
[foo_httpcontrol](https://hydrogenaud.io/index.php/topic,62218.0.html) template for [foobar2000](https://www.foobar2000.org) developed to be used in modern desktop or mobile browsers with responsive design; fully compatible with [Playlist-Tools-SMP](https://github.com/regorxxx/Playlist-Tools-SMP) and [Playlist-Manager-SMP](https://github.com/regorxxx/Playlist-Manager-SMP).

![ajquery](https://user-images.githubusercontent.com/83307074/193598636-730640f8-894e-45fa-a6f9-a722b59c5df8.gif)

## Features
* **Dynamic themes:** Dark, light or dynamic colors based on album art palette similar to [Georgia-ReBORN](https://github.com/TT-ReBORN/Georgia-ReBORN).
* **Full playback controls:** smart play/pause, stop, prev/next, random.
* **Extended controls:** sort playlist, queue, etc.
* **Library browser:** by path.
* **Query browser:** by configured tags.
* **Artwork support:** front cover or disc animation.
* **Console logging:** able to read a txt file on server (for ex. the console log).
* **Contextual menus:** able to run any contextual menu by name.
* **Rating:** displayed on playlist and full tagging support.
* **Playlist Tools:** Full integration with SMP script; all tools and menus, output and DSP selection.
* **Playlist Manager:** Full integration with SMP script;  browse, load, lock, create, ... playlist files.

![image](https://user-images.githubusercontent.com/83307074/236062127-7b1cc092-17e2-4b92-8e81-05d82e1c69a2.png)

## Comparison to old ajquery
* Full and tested responsive design.
* Tile, artist, album tags are cut at display to soft-force one track per row.
* General tweaks to UI placement, space usage, fonts (larger) and many QOL changes.
* Rating is now shown on the playlist list for every item (stars).
* Themes: dark/light and dynamic colors. (new themes may be easily added editing the html)
* Default 20 items per page.
* Artwork: non-playing and non-artwork found images are now animations.
* Extended controls reworked: rating and Custom contextual menu Buttons.
* Playlist Tools: Spider Monkey Menus, Output Devide & DSP selection.
* Playlist manager: Browse playlist files and load them on demand.
* Integration with Spider Monkey Panel.
* Dynamic icons, menus, tooltips and component checking via SMP.
* Toggleable log panel (usually used to display console log from foobar).
* Query browser filtering.
* Builtin documentation.
* Fixes to bugs on previous versions.

### Compatible with
 1. [Playlist-Tools-SMP](https://github.com/regorxxx/Playlist-Tools-SMP): Full integration with all tools and menus, output and DSP selection,...
 2. [Playlist-Manager-SMP](https://github.com/regorxxx/Playlist-Manager-SMP): Full integration with playlist files (browse, load, lock, create, ...)
 3. [foo_quicksearch](https://www.foobar2000.org/components/view/foo_quicksearch): Buttons to search for title, artist and genre queries.
 4. [foo_youtube](https://fy.3dyd.com/home/): Buttons to search for acoustic versions, collaborations, tracks by artist, etc.

## Installation
See [_readme (txt)](https://github.com/regorxxx/ajquery-xxx/blob/main/_readme.txt). Not properly following the installation instructions will result in scripts not working as intended. Please don't report errors before checking this.

To use this plugin at its best, [foo_run_main](https://marc2k3.github.io/run-main/) is required. It's used to run dynamic contextual menus.

### More images
![image](https://user-images.githubusercontent.com/83307074/236061990-3c8205a9-66da-4130-8c6a-c9d03f615db9.png)

![image](https://user-images.githubusercontent.com/83307074/236061283-d7cd7bbf-e309-4889-a222-83980142ad84.png)

![image](https://user-images.githubusercontent.com/83307074/236061184-6320818c-7160-42bc-b36e-a1bb5c86b938.png)

[changelog]: CHANGELOG.md
[version_badge]: https://img.shields.io/github/release/regorxxx/ajquery-xxx.svg
[codacy_badge]: https://api.codacy.com/project/badge/Grade/e04be28637dd40d99fae7bd92f740677
[codefactor_badge]: https://www.codefactor.io/repository/github/regorxxx/ajquery-xxx/badge/main
