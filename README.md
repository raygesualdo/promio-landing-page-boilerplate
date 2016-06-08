# Promio Landing Page Boilerplate

A highly opinionated boilerplate for developing Promio landing pages.

## Getting Started

> NOTE: This boilerplate requires [Node v4+ and npm](https://nodejs.org/en/).

1. Run `npm -g install gulp-cli` to install the Gulp CLI globally.
1. Download or clone this repo.
1. Run `npm install` in the project directory.

You're all set and ready to go. See the __How To Use__ section for information on Gulp commands and project directory structure.


## How To Use

Since the purpose of this boilerplate is to speed landing page development, it is set up honoring convention over configuration. As long as files are placed in the correct folders, they will be processed correctly. See the table below for how each file/directory in the project works:

| File/Directory | Behavior |
| --------- | ------- |
| `build/` | All processed files will be created here by Gulp. Do not add files manually as this directory is cleaned out regularly. |
| `css/` | Any files placed in this folder will be copied into `build/css/` during the build process. |
| `fonts/` | Any files placed in this folder will be copied into `build/fonts/` during the build process. |
| `images/` | Any files placed in this folder will be copied into `build/images/` during the build process. Additionally, any `jpg`, `png`, `gif`, and `svg` files will be losslessly minified. |
| `js/scripts.js` | This file will be minified and copied into `build/js/`. No other javascript files should be included at this level of the `js/` directory. |
| `js/vendor/` | Any `*.js` files placed in this folder will be concatenated and copied into `build/js/` as `vendor.js`. This process does not include minification so any files placed in here should be production ready. |
| `scss/styles.scss` | This file will be pre-processed, autoprefixer-ed, minified and copied into `build/css/`. During development, sourcemaps will also be created. Any sass includes or include directories should be adjacent this file. |
| `.env.example` | Ignore. This file is only relevant to a user handling the deploy process. |
| `gulpfile.js` | Where all the magic happens. Refer to the source for more information on available Gulp tasks. |
| `index.html` | This file will be copied into `build/`. All HTML code for the landing page should be placed in this file. All pre-existing HTML can be replaced; it is merely a barebones example. |

Additionally, you should only need to run the Gulp default task (`gulp`) when developing. This command:

- Cleans out the build directory
- Processes `styles.scss` with sourcemaps
- Copies CSS files
- Concats and copies vendor JS files
- Copies `scripts.js`
- Minifies and copies images
- Copies `index.html`
- Starts a [Browsersync](https://www.browsersync.io/) instance with multi-device support and live reload
- Watches for changes in the project and processes accordingly

See `gulpfile.js` for additional inline documentation about available commands.

## Allowed Input Names
When building a form, there are a fixed set of allowed input names (`<input name="XXXXXX" />`) for our system. These are included in the table below:

| Name Value | Snippet | Explanation |
| ---------- | ------- | ----------- |
| inputFName | `<input name="inputFName" />` | Customer's first name |
| inputLName | `<input name="inputLName" />` | Customer's last name |
| inputEmail | `<input name="inputEmail" />` | Customer's email address |
| inputPhone | `<input name="inputPhone" />` | Customer's phone number |
| inputAddress | `<input name="inputAddress" />` | Customer's first address line |
| inputAddress2 | `<input name="inputAddress2" />` | Customer's second address line |
| inputAddress3 | `<input name="inputAddress3" />` | Customer's third address line |
| inputCity | `<input name="inputCity" />` | Customer's city |
| inputStProvince | `<input name="inputStProvince" />` | Customer's state or province |
| inputZip | `<input name="inputZip" />` | Customer's zip/postal code |
| inputCountry | `<input name="inputCountry" />` | Customer's country |
| inputBirthdate | `<input name="inputBirthdate" />` | Customer's birthday |
| inputGender | `<input name="inputGender" />` | Customer's gender |
| inputCompanyName | `<input name="inputCompanyName" />` | Customer's name of company/employer |
| inputMobilePhone | `<input name="inputMobilePhone" />` | Customer's cell phone number |
| inputTitle | `<input name="inputTitle" />` | Customer's business title |
| inputWorkPhone | `<input name="inputWorkPhone" />` | Customer's work phone number |
| inputFax | `<input name="inputFax" />` | Customer's personal fax number |
| inputWorkFax | `<input name="inputWorkFax" />` | Customer's work fax number |


## Todos
- Add more notifications
- Better error handling (add `gulp-plumber`)
- Build out index.html with inline comments
- Convert `sass` task to handle multiple sass files
- JS linting

## Contributing

This boilerplate is a work in progress. Feel free to add suggestions as issues or create pull requests. Any and all feedback is appreciated.
