## [fbgabriana.github.io](/ "Bamm's KodeGo Repository") / [brgykodego](/brgykodego/)

# Barangay KodeGo

Barangay KodeGo is an interactive barangay **content management system** submitted as a Capstone Project for Batch 18 of KodeGo's full stack web development course (WD-18).

It is written in pure NodeJS without any frameworks on a MySQL database. A port to the MEAN stack is planned, but not in the works.

* [View a working demo](http://brgykodego.herokuapp.com/){:target="_projectpage"}

* [View the source](https://github.com/fbgabriana/brgykodego){:target="_projectsource"}

![screenshot](screenshot.svg)

## Setup instructions:

* To set up _brgykodego_ as a local server:

	1. Download and extract the source.
	1. Make sure the commands `npm` and `mysql` are in your path.
	1. On the terminal, go to the project folder and do `npm run setup`.
	1. Once setup completes, start it anytime by running `npm start`.

* To set up a custom _brgykodego_ as a remote server:

	1. Clone this project on GitHub and make changes according to your need.
	1. Create a project on a host that allows running web applications, e.g., Heroku.
	1. Associate your project account to your GitHub repository, i.e., don't maintain them separately.
	1. Use a remote MySQL server such as ClearDB instead of your local SQL server.
	1. Set up your project to use your remote MySQL server.
	1. The application should show up online now.
	1. If on Heroku, you can additionally install the `heroku` command line for remote debugging.

