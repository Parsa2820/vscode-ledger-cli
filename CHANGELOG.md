# Change Log

All notable changes to the "ledger-cli" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.0] - 2026-05-01

### Added
- Automatic discovery of `.ledger` files in workspace and subdirectories
- File system watchers to automatically update accounts when files change
- Configuration watchers to reload accounts when settings change

### Improved
- Fixed async account loading to ensure completions are available immediately
- Better deduplication of accounts using Set data structure
- Enhanced error handling with debug logging

### Features
- Account auto-completion now searches workspace recursively for all `.ledger` files
- Support for `ledger.accountFiles` setting for additional account sources
- Fallback to default example accounts if no files found

## [0.0.3] - 2025-09-17
- Implemented account auto completion

## [0.0.2] - 2025-07-17
- Improved formatting
- Added transaction status cycling command

## [0.0.1] - 2025-07-16
- Initial release