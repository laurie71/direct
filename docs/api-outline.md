# Outline

* direct
* direct.app                -- currently loaded application; aliases direct.framework.Application.instance
* direct.errors
* direct.framework
** .Application
** .DirectError
** .Framework
** .Plugin
** .Server
** .cli
** .compilers
*** .Locale
*** .Messages
*** .MessageSet
** .middleware
** .settings
* direct.i18n
* direct.server             -- instance of framework.Server service current app
* direct.template
* direct.util
** .logging

---

# API Details

## `direct.framework`

### `direct.framework.Application`
* extends `direct.framework.Plugin`

#### Static Members
* **Application.instance**
  The currently loaded applicaton.
  @see `Application.load()`
  
* **Application.load({String} path)**
  Load the application at `path`
  @throws `DirectError` if app is already loaded
  
#### Instance Members
* ...

### `direct.framework.DirectError`
### `direct.framework.Framework`
* extends `direct.framework.Plugin`

### `direct.framework.Plugin`
#### Static Members
* **Plugin.load(name)**
  Load plugin `name`. Plugin is searched for in
  `app.root.plugins` the `framework.root.plugins`.

#### Instance Members
* **{String} root**
* **{Plugin} parent**
* **{} settings**
* **{} messages**

* **init()**
* **message({String} key, {[Object]} args...)

### `direct.framework.cli`
### `direct.framework.logging`
