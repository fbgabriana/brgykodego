## [fbgabriana.github.io](/ "Bamm's KodeGo Repository") / [brgykodego](/brgykodego/)

# Barangay KodeGo

_Barangay KodeGo_ is an interactive barangay **content management system** submitted as a Capstone Project for Batch 18 of KodeGo's full stack web development course (WD-18).

It is written in vanilla NodeJS without any frameworks on a MySQL database.

* [View a working demo](https://brgykodego.herokuapp.com/){:target="_projectpage"}

* [View the source](https://github.com/fbgabriana/brgykodego){:target="_projectsource"}

![screenshot](screenshot.svg)

## Setup instructions:

✓ **To set up _`brgykodego`_ as a local server application:**

1. Download and extract the source.
1. Make sure the commands `npm` and `mysql` are in your path.
1. On the terminal, go to the project folder and do `npm run setup`.
1. Once setup completes, start it anytime by running `npm start`.

* Note: On your **`/etc/hosts`** file, you may have to set the following lines  
```
localhost	127.0.0.1
*.localhost	127.0.0.1
```

✓ **To set up a custom _`brgykodego`_ as a remote server application:**

1. Clone this project on GitHub and fork it to your own GitHub repository.
1. Create a remote project on a host that allows running web applications, e.g., Heroku.
1. Associate your remote project to your GitHub repository and set up automatic sync.
1. Use a remote MySQL server such as ClearDB instead of your localhost's SQL server.
1. If on Heroku, you can optionally install the `heroku` command line for remote debugging.
1. Restart the remote server. The application should show up online now.
