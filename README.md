# CGA Theme

This project uses a combination of node, gulp, and webpack to assemble the front end .js and .css assets for the CGA website. 
All of the source files can be found in the `./Source` directory.

## Dependencies 

* Node v10.20.1
* npm v6.14.4
* Gulp CLI v2.2.0 (can be install globally by running `npm install -g gulp-cli`)

## Getting Started

To get started, run:

```
npm install
```

This will install all of the projects dependencies in the `node_modules` folder

To ensure everything has been install properly, run:

```
gulp
```

You should recieve the following output:

```
Usage
  gulp [TASK] [OPTIONS...]

Available tasks
  build                Copy assets, build CSS, JS, and HTML. [build:css, build:js, build:css:prod, build:js:prod, build:assets]
  build:assets         Copy Assets folder to build folder
  build:css            Build CSS, Stylus & LESS --> CSS [build:css:css, build:css:stylus, build:css:less, build:css:sass]
  build:css:css        Build and add vendor prefixes for plain CSS
  build:css:less       Build and add vendor prefixes for LESS styles
  build:css:prod       Build CSS, Stylus & LESS --> CSS [build:css:css, build:css:stylus, build:css:less, build:css:sass:prod]
  build:css:sass       Build SASS styles with sourcemaps
  build:css:sass:prod  Build SASS styles
  build:css:stylus     Build and add vendor prefixes for Stylus styles
  build:js             Build JS
  build:js:froala      Build JS
  build:js:prod        Build JS for production
  build:prod           Copy assets, build CSS, JS, and HTML. [build:css:prod, build:js:prod, build:assets]
  help                 Display this help text.
  watch                Perform build when sources change. [watch:css, watch:js, watch:assets]
  watch:assets         Perform assets copy when sources change [build:assets]
  watch:css            Perform style build when sources change [build:css, build:css:sass:prod]
  watch:js             Perform js build when sources change [build:js, build:js:prod]

[16:57:45] Finished 'default' after
```

This output lists each task defined in the `./gulp-tasks` directory. A gulp task can be run using `gulp [TASK NAME]`

Running `gulp build` will compile all of the front end assets into the `./Build` directory.
Running `gulp watch` will compile all of the front end assets each time a file change is made in the `./Source` directory.

| Source                        | Compiled To                                                         | 
| :---                          | :---                                                                |
| `./Source/styles/main.scss`   | `./Build/styles/main.css`, `./Build/styles/main.prod.css`           |
| `./Source/styles/vendor.scss` | `./Build/styles/vendor.css`, `./Build/styles/vendor.prod.css`       |
| `./Source/js/App.scss`        | `./Build/js/app.css`, `./Build/js/app.js`, `./Build/js/app.prod.js` |

The `.prod` versions of the compiled files are minified and obfuscated and do not include source maps. 
