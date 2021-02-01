# Lines
A line-based note-taking app

## Description

Lines is a unique to-do list manager, featuring:

- Unique line-based structure - each line is a different to-do item
- Edit multiple lines at once in a Notepad-esque design (but with multiple levels of undo!)
- Add hashtags to your lines - they are auto-detected and become available as filters
- Organize your notes by category (Work, Home, etc.) in the sidebar
- If using the Chrome extension, data syncs across all of your Chrome sessions

## Use

This app can be built as a webapp, an electron app, or a chrome extension. 

To choose an app type, change the `REACT_APP_TYPE` variable in `.env` to either:

- chromeExtension
- webApp
- electron

The Chrome extension version is published here:
https://chrome.google.com/webstore/detail/lines-for-chrome/oijimpgbpaefegdplhkplfekoghifimp/