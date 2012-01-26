Node Jetpack
=============

Jetpack allows you to run any node project with a cluster. By replacing 
`node server.js` with `jetpack server.js` your project will be run in a
cluster. (It's really that easy.)


Stability
---------

This is a very new project (it's still v0.0.1), and there are likely 
issues with it. **Use this at your own risk**.


Installation
-----------

    npm install jetpack -g


Usage
-----

    jetpack my-awesome-node-project.js

### Options

* **-w <workers>** specify number of workers
* **-s** show stats at http://localhost:8444


Dependencies
------------

* Node v0.7.x
* Commander v0.5.x


Contributing
------------

I'd love any contributions to this project. Just fork it and create a pull 
request (with passing tests) .