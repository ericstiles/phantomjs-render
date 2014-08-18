# Phantomjs-Render

### This is application works, although it is very rough around the edges.

Starting with http://localhost all <a> node links from each page are stored in an array.  Phantomjs opens each page as a link, rather than clicking the link on the page, thus, javscript associated to clicking the link is not run.  For each link opened viewport a loop of provided viewport sizes is run and a png image is rendered to file.

Links leading off local host are skipped.

This code is based on example code provided in phantomjs github project.

## Usage

```
phantomjs index.js
```

