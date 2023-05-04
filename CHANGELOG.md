# Changelog

## [Table of Contents]
- [Unreleased](#unreleased)
- [0.96](#096---2023-05-05)
- [0.95](#095---2023-05-04)
- [0.94](#094---2023-03-07)
- [0.93](#093---2023-03-05)

## [Unreleased][]
### Added
### Changed
### Removed
### Fixed

## [0.96] - 2023-05-05
### Added
- Contextual menu with basic functionality on a player context, replaces the native web browser contextual menu (available pressing Shift + R. Click). Further features will be added on future updates.
- Undo action also available via Ctrl + z.
- Redo action also available via Ctrl + y.
### Changed
- All js files are now deferred after the entire template is loaded. This also fixes console warnings about 'Layout was forced before the page was fully loaded. If stylesheets are not yet loaded this may cause a flash of unstyled content.' on Firefox.
- Code cleanup.
### Removed
### Fixed
- Removed static image fallback for dynamic colors usage when no album art was found (which was never implemented). Fallback to theme used instead. Fixes console warnings about file not being found. Functionality doesn't change at all for final user.
- Selection not being preserved after connection re-check. Bug introduced on v0.95.
- Changed some optimizations in vibrant library to comply with modern V8 usage. Also fixes console warnings about 'Unreachable code after return statement'.
- Updated cookie usage to current standards. Now uses 'SameSite=Strict' following [mozilla guidelines](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie);

## [0.95] - 2023-05-04
### Added
- Template version is now shown on the help button and dialog window title.
### Changed
- Colors will change based on album art palette when the album art is shown, similar to [Georgia-ReBORN](https://github.com/TT-ReBORN/Georgia-ReBORN). Option may be set at 'xxx\config-theme.json', enabled by default.
- Dark theme is now the default theme.
- Cursor no longer changes while connection is re-checked (loading indicator).
- Rating and track length are now split into 2 columns, so they always get aligned properly no matter the number of digits (for ex. 10:23 vs 3:20).
- Code cleanup.
### Removed
### Fixed
- Playlist Tools menu entries (listener) not sending commands to proper playlist if 'PT:listener' did not exist before (i.e. working on second command sent not the first one).
- Window height increasing indefinitely when showing artwork due to server re-connection added on v0.94.

## [0.94] - 2023-03-07
### Added
- Template will try to reconnect when server is unreachable every 10 secs.
- Template will check server connection every 10 secs (and adjust UI accordingly).
### Changed
- Improved AJAX errors dialog popups.
### Removed
### Fixed
- Play/pause icon is now properly set on init (according to foobar playing state).

## [0.93] - 2023-03-05
### Added
- First release.
### Changed
### Removed
### Fixed

[Unreleased]: https://github.com/regorxxx/ajquery-xxx/compare/v0.96...HEAD
[0.96]: https://github.com/regorxxx/ajquery-xxx/compare/v0.95...v0.95
[0.95]: https://github.com/regorxxx/ajquery-xxx/compare/v0.94...v0.95
[0.94]: https://github.com/regorxxx/ajquery-xxx/compare/v0.93...v0.94
[0.93]: https://github.com/regorxxx/ajquery-xxx/compare/2fd0f3d...v0.93