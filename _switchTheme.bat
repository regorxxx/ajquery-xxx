@ECHO off
setlocal
findstr /m /c:"ajquery-xxx/img/vinyl.gif" config > tmpFile.txt
SET /p check=<tmpFile.txt
DEL tmpFile.txt
IF "%check%" == "config" (
	REM Light -> dark
	cmd\fart config "albumart_not_found=ajquery-xxx/img/vinyl-playing.gif" "albumart_not_found=ajquery-xxx/img/vinyl-playing-dark.gif"
	cmd\fart config "albumart_not_available=ajquery-xxx/img/vinyl.gif" "albumart_not_available=ajquery-xxx/img/vinyl-dark.gif"
	cmd\fart xxx\config-theme.json "\"light\"" "\"dark\""
	ECHO.
	ECHO Dark mode enabled.
) ELSE (
	REM Dark -> light
	cmd\fart config "albumart_not_found=ajquery-xxx/img/vinyl-playing-dark.gif" "albumart_not_found=ajquery-xxx/img/vinyl-playing.gif"
	cmd\fart config "albumart_not_available=ajquery-xxx/img/vinyl-dark.gif" "albumart_not_available=ajquery-xxx/img/vinyl.gif"
	cmd\fart xxx\config-theme.json "\"dark\"" "\"light\""
	ECHO.
	ECHO Ligth mode enabled.
)