# Changelog

## [Table of Contents]
- [Unreleased](#unreleased)
- [0.95](#095---2023-05-04)
- [0.94](#094---2023-03-07)
- [0.93](#093---2023-03-05)

## [Unreleased][]
### Added
### Changed
### Removed
### Fixed

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

[Unreleased]: https://github.com/regorxxx/ajquery-xxx/compare/v0.95...HEAD
[0.95]: https://github.com/regorxxx/ajquery-xxx/compare/v0.94...v0.95
[0.94]: https://github.com/regorxxx/ajquery-xxx/compare/v0.93...v0.94
[0.93]: https://github.com/regorxxx/ajquery-xxx/compare/2fd0f3d...v0.93